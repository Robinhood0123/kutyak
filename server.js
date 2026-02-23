require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const session = require('express-session');

const app = express();
app.use(cors({
  origin: true, // Engedélyez minden origint (fejlesztéshez jó)
  credentials: true // Ez engedi át a sütiket/sessiont
}));

// --- Session beállítása (A CORS elé vagy után) ---
app.use(session({
  secret: 'nemtudommitkellideirni',
  resave: false,
  saveUninitialized: false, // Ezt állítsd false-ra
  cookie: { 
      secure: false, // Fejlesztés alatt, HTTP-n maradjon false
      httpOnly: true,
      sameSite: 'lax'
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statikus fájlok
app.use(express.static(path.join(__dirname, 'public')));

app.use('/img', express.static(path.join(__dirname, 'public', 'img')));


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

// --- CSP lazább fejlesztéshez (MÓDOSÍTVA NGROKHOZ) ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:; connect-src *;"
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

  // MÓDOSÍTVA: Relatív útvonal használata localhost helyett
  const kepUrl = req.file ? `/img/kutyak/${req.file.filename}` : null;

  const checkFajta = 'SELECT fajta_id FROM fajtak WHERE nev = ? LIMIT 1';
  db.query(checkFajta, [fajta], (err, results) => {
      if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });

      if (results.length > 0) {
          const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url, leiras) VALUES (?, ?, ?, ?, ?, ?)';
          db.query(sql, [nev, eletkor || null, nem || null, results[0].fajta_id, kepUrl, leiras || null], err3 => {
              if (err3) return res.status(500).json({ error: 'Adatbázis hiba mentésnél!' });
              res.json({ message: 'Kutya sikeresen hozzáadva!' });
          });
      } else {
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
app.post('/register', async (req, res) => {
  const { nev, email, jelszo } = req.body;
  if (!nev || !email || !jelszo) return res.status(400).json({ error: 'Minden mezőt ki kell tölteni!' });

  const checkSql = 'SELECT * FROM felhasznalok WHERE email = ?';
  db.query(checkSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
      if (results.length > 0) return res.status(400).json({ error: 'Ez az email már regisztrálva van!' });

      bcrypt.hash(jelszo, 10, async (err, hash) => {
          if (err) return res.status(500).json({ error: 'Hashelési hiba!' });

          const insertSql = 'INSERT INTO felhasznalok (felhasznalonev, email, jelszo, szerepkor, kep_url) VALUES (?, ?, ?, ?, ?)';
          
          db.query(insertSql, [nev, email, hash, 'onkentes', null], async (err2) => {
              if (err2) {
                  return res.status(500).json({ error: 'Adatbázis mentési hiba: ' + err2.sqlMessage });
              }

              try {
                  const welcomeMail = {
                      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                      to: email,
                      subject: 'Sikeres regisztráció - Robi&Ricsi&Norbi Kutyamenhely',
                      html: `
                          <h2>Köszönjük a regisztrációt, ${nev}!</h2>
                          <p>Sikeresen regisztráltál a kutyamenhelyünk weboldalán!</p>
                          <p><strong>Bejelentkezési címed:</strong> <a href="https://unantagonized-delisa-oneiric.ngrok-free.dev">kutyamenhely.hu</a></p>
                          <hr>
                          <p><strong>Robi&Ricsi&Norbi Kutyamenhely</strong></p>
                      `
                  };

                  await transporter.sendMail(welcomeMail);
                  console.log('Regisztrációs email sikeresen elküldve:', email);
                  
              } catch (emailError) {
                  console.error('Regisztrációs email küldési hiba:', emailError);
              }

              res.json({ message: 'Sikeres regisztráció! Ellenőrizd az emailedet a megerősítő üzenetért.' });
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

      // --- SESSION MENTÉSE ---
      // Ez az a rész, amitől a szerver emlékezni fog a felhasználóra
      req.session.userId = user.felhasznalo_id;
      req.session.felhasznalo_id = user.felhasznalo_id; 

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


app.post('/user/update', uploadProfile.single('profilkep'), async (req, res) => {
    const { email, nev, jelszo } = req.body;
    let updateFields = [];
    let params = [];

    if (nev) {
        updateFields.push("felhasznalonev = ?");
        params.push(nev);
    }

    if (req.file) {
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
            
            res.json({ 
                message: "Profil sikeresen frissítve!", 
                user: {
                    nev: results[0].felhasznalonev,
                    email: results[0].email,
                    kep: results[0].kep_url
                }
            });
        });
    });
});


app.post('/api/adoption', async (req, res) => {
  // 1. Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
  // Ha a session-ben máshogy tárolod (pl. req.session.user.id), írd át!
  const felhasznaloId = req.session.userId || req.session.felhasznalo_id;

  if (!felhasznaloId) {
    return res.status(401).json({ 
      success: false, 
      error: 'A jelentkezéshez be kell jelentkezned!' 
    });
  }

  const {
    telefonszam, iranyitoszam, varos, utcaHazszam,
    lakasTipus, ingatlanTipus, kert,
    kutyaTapasztalat, csaladEgyetert,
    kutyaId, megjegyzes, elfogadom
  } = req.body;

  // Validálás (nev és email itt már nem kell, mert az adatbázisból jönnek az ID alapján)
  if (!telefonszam || !iranyitoszam || !varos || !utcaHazszam || 
      !lakasTipus || !ingatlanTipus || !kert || !kutyaTapasztalat || 
      !csaladEgyetert || !elfogadom) {
    return res.status(400).json({ 
      success: false, 
      error: 'Kérlek, töltsd ki az összes kötelező mezőt!' 
    });
  }

  try {
    // 2. Mentés az adatbázisba (Csak azokat az oszlopokat használjuk, amik léteznek az SQL-edben)
    const sql = `
      INSERT INTO orokbefogadasok (
        felhasznalo_id, kutya_id, telefonszam, 
        iranyitoszam, varos, utca_hazszam,
        lakas_tipus, ingatlan_tipus, kert,
        kutya_tapasztalat, statusz, letrehozva
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'folyamatban', NOW())
    `;

    const values = [
      felhasznaloId, kutyaId || null, telefonszam,
      iranyitoszam, varos, utcaHazszam,
      lakasTipus, ingatlanTipus, kert,
      kutyaTapasztalat
    ];

    db.query(sql, values, async (err, result) => {
      if (err) {
        console.error('Hiba az örökbefogadás mentésekor:', err);
        return res.status(500).json({ success: false, error: 'Adatbázis hiba!' });
      }

      try {
        // 3. Felhasználó adatainak lekérése az email küldéshez
        db.query("SELECT felhasznalonev, email FROM felhasznalok WHERE felhasznalo_id = ?", [felhasznaloId], async (uErr, users) => {
          if (uErr || users.length === 0) return res.json({ success: true, message: 'Mentve, de email hiba (user nem található).' });

          const user = users[0];

          // Admin email
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `[ÚJ ÖRÖKBEFOGADÁS] ${user.felhasznalonev}`,
            html: `<h3>Új jelentkezés!</h3><p>Felhasználó: ${user.felhasznalonev}</p><p>Város: ${varos}</p>`
          });

          // User visszaigazoló email
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Sikeres jelentkezés - Kutyamenhely',
            html: `<h3>Kedves ${user.felhasznalonev}!</h3><p>Jelentkezésedet rögzítettük.</p>`
          });

          res.json({ success: true, message: 'Jelentkezésedet sikeresen rögzítettük!' });
        });

      } catch (emailError) {
        console.error('Email küldési hiba:', emailError);
        res.json({ success: true, message: 'Jelentkezés rögzítve, de az email küldése sikertelen.' });
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Váratlan hiba történt!' });
  }
});

// --- Index oldal ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Szerver fut a 3000-es porton'));