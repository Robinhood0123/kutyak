require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statikus fájlok
app.use(express.static(path.join(__dirname, 'public')));


// --- Profilkép mappa létrehozása ---
const profileDir = path.join(__dirname, 'public/img/profilok');
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}


// --- Multer beállítás ---
const uploadDir = path.join(__dirname, 'public/img/kutyak');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Multer profilképekhez
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
});
const uploadProfile = multer({ storage: profileStorage });


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- MySQL kapcsolat ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'menhely',
  port: 3307
});
db.connect(err => {
  if (err) console.error('MySQL kapcsolódási hiba:', err);
  else console.log('MySQL kapcsolat sikeres');
});

// --- CSP lazább fejlesztéshez ---
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*; img-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});

// --- Email transporter ---
const required = ['EMAIL_USER','EMAIL_PASS','EMAIL_FROM','ADMIN_EMAIL'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Hiányzó környezeti változó: ${k}`);
    process.exit(1);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log('SMTP kapcsolat rendben'))
  .catch(err => {
    console.error('SMTP kapcsolat hiba:', err);
    process.exit(1);
  });

// --- Feedback endpoint ---
app.post('/api/feedback', async (req, res) => {
  const { name, email, message } = req.body;
  if (!email || !message) return res.status(400).json({ success: false, error: 'Hiányzó mezők' });

  const adminMail = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `[Visszajelzés] ${name || 'Név nélkül'} - ${email}`,
    text: `Új visszajelzés érkezett.\n\nNév: ${name || '—'}\nEmail: ${email}\n\nÜzenet:\n${message}`
  };

  const userMail = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: process.env.FEEDBACK_SUBJECT || 'Köszönjük a visszajelzésedet',
    text: `Kedves ${name || 'Felhasználó'},\n\nKöszönjük, megkaptuk az üzenetedet. Hamarosan válaszolunk.\n\nÜdvözlettel,\nA csapat`
  };

  try {
    const adminInfo = await transporter.sendMail(adminMail);
    let userInfo = null;
    try {
      userInfo = await transporter.sendMail(userMail);
    } catch (userErr) {
      console.warn('Felhasználói visszaigazoló email küldése sikertelen:', userErr);
    }

    return res.json({
      success: true,
      adminMessageId: adminInfo.messageId,
      userMessageId: userInfo ? userInfo.messageId : null
    });
  } catch (err) {
    console.error('Hiba az email küldésekor:', err);
    return res.status(500).json({ success: false, error: 'Nem sikerült elküldeni az emailt' });
  }
});

app.post('/kutyak', upload.single('kep'), (req, res) => {
  const { nev, eletkor, nem, fajta, leiras } = req.body; 
  if (!nev || !fajta) return res.status(400).json({ error: 'Hiányzó adatok!' });

  const kepUrl = req.file ? `${req.protocol}://${req.get('host')}/img/kutyak/${req.file.filename}` : null;

  const checkFajta = 'SELECT fajta_id FROM fajtak WHERE nev = ? LIMIT 1';
  db.query(checkFajta, [fajta], (err, results) => {
      if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });

      if (results.length > 0) {
          // 1. HA LÉTEZIK A FAJTA: Mentés közvetlenül
          const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url, leiras) VALUES (?, ?, ?, ?, ?, ?)';
          db.query(sql, [nev, eletkor || null, nem || null, results[0].fajta_id, kepUrl, leiras || null], err3 => {
              if (err3) return res.status(500).json({ error: 'Adatbázis hiba mentésnél!' });
              res.json({ message: 'Kutya sikeresen hozzáadva!' });
          });
      } else {
          // 2. HA NEM LÉTEZIK A FAJTA: Előbb fajta mentés, utána kutya mentés
          const insertFajta = 'INSERT INTO fajtak (nev) VALUES (?)';
          db.query(insertFajta, [fajta], (err2, result2) => {
              if (err2) return res.status(500).json({ error: 'Adatbázis hiba fajta mentésnél!' });

              const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url, leiras) VALUES (?, ?, ?, ?, ?, ?)';
              db.query(sql, [nev, eletkor || null, nem || null, result2.insertId, kepUrl, leiras || null], err4 => {
                  if (err4) return res.status(500).json({ error: 'Adatbázis hiba kutya mentésnél!' });
                  res.json({ message: 'Kutya sikeresen hozzáadva!' });
              });
          });
      }
  });
});

app.get('/kutyak', (req, res) => {
  const sql = `
    SELECT k.kutya_id, k.nev, k.eletkor, k.nem, k.kep_url, k.leiras, f.nev AS fajta
    FROM kutyak k
    JOIN fajtak f ON k.fajta_id = f.fajta_id
    ORDER BY k.kutya_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hiba a kutyák lekérdezésekor:', err);
      return res.status(500).json({ error: 'Nem sikerült lekérni a kutyák adatait' });
    }
    res.json(results);
  });
});


function insertKutya(nev, eletkor, nem, fajta_id, kepUrl, res) {
  const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nev, eletkor || null, nem || null, fajta_id, kepUrl], err => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba kutya beszúrásnál!' });
    res.json({ message: 'Kutya sikeresen hozzáadva!' });
  });
}

// --- Regisztráció ---
app.post('/register', (req, res) => {
  const { nev, email, jelszo } = req.body;
  if (!nev || !email || !jelszo) return res.status(400).json({ error: 'Minden mezőt ki kell tölteni!' });

  const checkSql = 'SELECT * FROM felhasznalok WHERE email = ?';
  db.query(checkSql, [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
      if (results.length > 0) return res.status(400).json({ error: 'Ez az email már regisztrálva van!' });

      bcrypt.hash(jelszo, 10, (err, hash) => {
          if (err) return res.status(500).json({ error: 'Hashelési hiba!' });

          // Hozzáadtuk a kep_url-t az INSERT-hez (alapértelmezett értéke null)
          const insertSql = 'INSERT INTO felhasznalok (felhasznalonev, email, jelszo, szerepkor, dolgozo_id, kep_url) VALUES (?, ?, ?, ?, ?, ?)';
          
          db.query(insertSql, [nev, email, hash, 'onkentes', null, null], (err2) => {
              if (err2) {
                  return res.status(500).json({ error: 'Adatbázis mentési hiba: ' + err2.sqlMessage });
              }
              res.json({ message: 'Sikeres regisztráció!' });
          });
      });
  });
});

// --- Bejelentkezés ---
app.post('/login', (req, res) => {
  const { email, jelszo } = req.body;
  if (!email || !jelszo) {
    return res.status(400).json({ error: 'Hiányzó adatok!' });
  }

  const sql = 'SELECT * FROM felhasznalok WHERE email = ? LIMIT 1';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba!' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Hibás email vagy jelszó!' });
    }

    const user = results[0];

    bcrypt.compare(jelszo, user.jelszo, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Jelszó ellenőrzési hiba!' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Hibás email vagy jelszó!' });
      }

      // sikeres bejelentkezés
      res.json({
        message: 'Sikeres bejelentkezés!',
        user: {
          id: user.felhasznalo_id,
          nev: user.felhasznalonev,
          email: user.email,
          szerepkor: user.szerepkor,
          kep: user.kep_url
        }
      });
    });
  });
});


// --- Profil frissítése endpoint módosítása ---
app.post('/user/update', uploadProfile.single('profilkep'), async (req, res) => {
    const { email, nev, jelszo } = req.body;
    let updateFields = [];
    let params = [];

    if (nev) {
        updateFields.push("felhasznalonev = ?");
        params.push(nev);
    }

    if (req.file) {
        // A teljes URL helyett csak a relatív utat mentsük el!
        // Így az adatbázisban csak ennyi lesz: /img/profilok/profile-123.jpg
        const kepEleresiUt = `/img/profilok/${req.file.filename}`;
        updateFields.push("kep_url = ?");
        params.push(kepEleresiUt);
    }

    if (jelszo && jelszo.trim() !== "") {
        const hash = await bcrypt.hash(jelszo, 10);
        updateFields.push("jelszo = ?");
        params.push(hash);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: "Nincs módosítandó adat!" });
    }

    params.push(email);
    const sql = `UPDATE felhasznalok SET ${updateFields.join(", ")} WHERE email = ?`;

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: "Adatbázis hiba!" });
        
        db.query("SELECT felhasznalonev, email, kep_url FROM felhasznalok WHERE email = ?", [email], (err2, results) => {
            if (err2) return res.status(500).json({ error: "Hiba lekéréskor!" });
            
            // Itt visszaadjuk az új adatokat a frontendnek
            res.json({ 
                message: "Profil sikeresen frissítve!", 
                user: {
                    nev: results[0].felhasznalonev,
                    email: results[0].email,
                    kep: results[0].kep_url // Ez most már a relatív út lesz
                }
            });
        });
    });
});


// --- Index oldal ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Szerver fut a 3000-es porton'));
