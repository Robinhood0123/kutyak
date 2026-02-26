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
    subject: `🐾 [Visszajelzés] ${name || 'Névtelen'} – ${email}`,
    html: `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 48px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🐾</div>
            <h1 style="color:#e94560;margin:0;font-size:28px;font-weight:800;letter-spacing:1px;">Robi &amp; Ricsi &amp; Norbi</h1>
            <p style="color:#a0aec0;margin:6px 0 0;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Kutyamenhely</p>
          </td>
        </tr>
        <!-- BADGE -->
        <tr>
          <td style="background:#e94560;padding:10px 48px;text-align:center;">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">📬 Új visszajelzés érkezett</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:40px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f7fafc;border-radius:12px;padding:24px;border-left:4px solid #e94560;">
                  <table width="100%">
                    <tr>
                      <td width="120" style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:12px;">👤 Feladó neve</td>
                      <td style="color:#1a202c;font-size:14px;font-weight:700;padding-bottom:12px;">${name || '<em>Névtelen</em>'}</td>
                    </tr>
                    <tr>
                      <td style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:12px;">✉️ E-mail cím</td>
                      <td style="padding-bottom:12px;"><a href="mailto:${email}" style="color:#e94560;font-weight:700;text-decoration:none;">${email}</a></td>
                    </tr>
                    <tr>
                      <td colspan="2" style="border-top:1px solid #e2e8f0;padding-top:16px;">
                        <p style="color:#4a5568;font-size:13px;font-weight:600;margin:0 0 8px;">💬 Üzenet</p>
                        <p style="color:#1a202c;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#4a5568;font-size:13px;text-align:center;">📅 Beérkezett: ${new Date().toLocaleString('hu-HU', {timeZone:'Europe/Budapest'})}</p>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 48px;text-align:center;">
            <p style="color:#a0aec0;font-size:12px;margin:0;">Robi &amp; Ricsi &amp; Norbi Kutyamenhely &bull; Belső admin értesítő</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  };

  const userMail = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: process.env.FEEDBACK_SUBJECT || '🐾 Köszönjük a visszajelzésedet!',
    html: `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:48px;text-align:center;">
            <div style="font-size:64px;margin-bottom:12px;">🐶</div>
            <h1 style="color:#ffffff;margin:0;font-size:30px;font-weight:800;">Köszönjük, ${name || 'kedves barátunk'}!</h1>
            <p style="color:#a0aec0;margin:10px 0 0;font-size:15px;">Megkaptuk az üzenetedet 💌</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:48px;">
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 24px;">Szia <strong style="color:#1a202c;">${name || 'ismeretlen barátunk'}</strong> 👋</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 24px;">Hatalmas köszönet, hogy időt szántál arra, hogy írj nekünk! A visszajelzésed rendkívül sokat jelent a menhelyünk és a gondozásunkban lévő kutyusok számára. 🐾</p>
            <!-- Quote box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;padding:24px;text-align:center;">
                  <p style="color:#fff;font-size:18px;font-weight:700;margin:0;line-height:1.5;">"Minden egyes szó segít abban, hogy<br>jobb otthont teremtsünk a kutyusoknak." 🐕</p>
                </td>
              </tr>
            </table>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 16px;">Csapatunk hamarosan átnézi az üzenetedet és <strong style="color:#e94560;">48 órán belül</strong> visszajelzünk neked!</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0;">Addig is, ha sürgős a dolgod, keress minket bátran közvetlenül! 😊</p>
          </td>
        </tr>
        <!-- STATS ROW -->
        <tr>
          <td style="background:#f7fafc;padding:32px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" align="center" style="padding:0 8px;">
                  <div style="font-size:32px;">🏠</div>
                  <p style="color:#1a202c;font-weight:800;font-size:20px;margin:4px 0 2px;">50+</p>
                  <p style="color:#4a5568;font-size:12px;margin:0;">Kutya a menhelyen</p>
                </td>
                <td width="33%" align="center" style="padding:0 8px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                  <div style="font-size:32px;">❤️</div>
                  <p style="color:#1a202c;font-weight:800;font-size:20px;margin:4px 0 2px;">200+</p>
                  <p style="color:#4a5568;font-size:12px;margin:0;">Sikeres örökbefogadás</p>
                </td>
                <td width="33%" align="center" style="padding:0 8px;">
                  <div style="font-size:32px;">⭐</div>
                  <p style="color:#1a202c;font-weight:800;font-size:20px;margin:4px 0 2px;">5★</p>
                  <p style="color:#4a5568;font-size:12px;margin:0;">Értékelés</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1a2e;padding:32px 48px;text-align:center;">
            <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 4px;">🐾 Robi &amp; Ricsi &amp; Norbi Kutyamenhely</p>
            <p style="color:#a0aec0;font-size:12px;margin:8px 0 0;">Ez egy automatikus értesítő email. Kérjük, ne válaszolj erre az üzenetre.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
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
  const { nev, eletkor, nem, fajta, leiras, vizsgalat_datum, oltast_kapott } = req.body; 
  if (!nev || !fajta) return res.status(400).json({ error: 'Hiányzó adatok!' });

  const kepUrl = req.file ? `/img/kutyak/${req.file.filename}` : null;
  const oltasErtek = parseInt(oltast_kapott) || 0;

  // 1. Megnézzük a fajtát
  db.query('SELECT fajta_id FROM fajtak WHERE nev = ? LIMIT 1', [fajta], (err, results) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba a fajtánál!' });

    const proceedWithSave = (f_id) => {
      const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url, leiras) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [nev, eletkor || null, nem || null, f_id, kepUrl, leiras || null], (err3, result) => {
        if (err3) return res.status(500).json({ error: 'Hiba a kutya mentésénél!' });

        const ujKutyaId = result.insertId;

        // 2. HA van orvosi adat, elmentjük, HA NINCS, itt küldjük a választ és megállunk (return)
        if (vizsgalat_datum && vizsgalat_datum.trim() !== "") {
          const sqlOrvosi = 'INSERT INTO orvosi_vizsgalatok (kutya_id, vizsgalat_datum, oltast_kapott) VALUES (?, ?, ?)';
          db.query(sqlOrvosi, [ujKutyaId, vizsgalat_datum, oltasErtek], (err4) => {
            if (err4) {
              console.error('Orvosi hiba:', err4);
              return res.json({ message: 'Kutya mentve, orvosi hiba.' });
            }
            return res.json({ message: 'Kutya és orvosi adatok sikeresen rögzítve!' });
          });
        } else {
          // Nincs orvosi adat, lezárjuk a kérést
          return res.json({ message: 'Kutya sikeresen hozzáadva!' });
        }
      });
    };

    if (results.length > 0) {
      proceedWithSave(results[0].fajta_id);
    } else {
      db.query('INSERT INTO fajtak (nev) VALUES (?)', [fajta], (err2, res2) => {
        if (err2) return res.status(500).json({ error: 'Fajta mentési hiba!' });
        proceedWithSave(res2.insertId);
      });
    }
  });
});

app.get('/kutyak', (req, res) => {
  const sql = `
    SELECT k.kutya_id, k.nev, k.eletkor, k.nem, k.kep_url, k.leiras, f.nev AS fajta,
    (SELECT MAX(vizsgalat_datum) FROM orvosi_vizsgalatok WHERE kutya_id = k.kutya_id) AS utolso_vizit,
    (SELECT oltast_kapott FROM orvosi_vizsgalatok WHERE kutya_id = k.kutya_id ORDER BY vizsgalat_datum DESC LIMIT 1) AS utolso_oltas_statusz
    FROM kutyak k
    JOIN fajtak f ON k.fajta_id = f.fajta_id
    ORDER BY k.kutya_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lekérdezési hiba!' });
    res.json(results);
  });
});

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
            subject: `🐾 [ÚJ ÖRÖKBEFOGADÁS] ${user.felhasznalonev} – #${result.insertId}`,
            html: `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 48px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🐾</div>
            <h1 style="color:#e94560;margin:0;font-size:26px;font-weight:800;letter-spacing:1px;">Robi &amp; Ricsi &amp; Norbi</h1>
            <p style="color:#a0aec0;margin:6px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Kutyamenhely · Admin Értesítő</p>
          </td>
        </tr>
        <tr>
          <td style="background:#e94560;padding:12px 48px;text-align:center;">
            <p style="color:#fff;margin:0;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">🏠 Új Örökbefogadási Jelentkezés · #${result.insertId}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td colspan="2" style="padding-bottom:20px;"><p style="margin:0;font-size:15px;color:#2d3748;">Egy új jelentkezés várakozik az elbírálásra. Az adatok alább olvashatók:</p></td></tr>
              <!-- Szekció: Azonosítás -->
              <tr><td colspan="2" style="background:#f7fafc;border-radius:10px;padding:20px;border-left:4px solid #e94560;margin-bottom:16px;">
                <p style="margin:0 0 12px;color:#c0392b;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">👤 Felhasználói Adatok</p>
                <table width="100%">
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;width:160px;padding-bottom:8px;">Név</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${user.felhasznalonev}</td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:8px;">Email</td><td style="padding-bottom:8px;"><a href="mailto:${user.email}" style="color:#c0392b;font-weight:700;text-decoration:none;">${user.email}</a></td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;">Telefonszám</td><td style="color:#1a202c;font-weight:700;">${telefonszam}</td></tr>
                </table>
              </td></tr>
              <tr><td colspan="2" style="height:12px;"></td></tr>
              <!-- Szekció: Lakcím -->
              <tr><td colspan="2" style="background:#f7fafc;border-radius:10px;padding:20px;border-left:4px solid #4c6ef5;">
                <p style="margin:0 0 12px;color:#3b5bdb;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">📍 Lakcím &amp; Lakókörnyezet</p>
                <table width="100%">
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;width:160px;padding-bottom:8px;">Cím</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${iranyitoszam} ${varos}, ${utcaHazszam}</td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:8px;">Lakás típusa</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${lakasTipus}</td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:8px;">Ingatlan típusa</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${ingatlanTipus}</td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;">Kert</td><td style="color:#1a202c;font-weight:700;">${kert}</td></tr>
                </table>
              </td></tr>
              <tr><td colspan="2" style="height:12px;"></td></tr>
              <!-- Szekció: Tapasztalat -->
              <tr><td colspan="2" style="background:#f7fafc;border-radius:10px;padding:20px;border-left:4px solid #2f9e44;">
                <p style="margin:0 0 12px;color:#2f9e44;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">🐕 Tapasztalat &amp; Egyéb</p>
                <table width="100%">
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;width:160px;padding-bottom:8px;">Kutya tapasztalat</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${kutyaTapasztalat}</td></tr>
                  <tr><td style="color:#4a5568;font-size:13px;font-weight:600;padding-bottom:8px;">Kutya ID</td><td style="color:#1a202c;font-weight:700;padding-bottom:8px;">${kutyaId || '—'}</td></tr>
                  ${megjegyzes ? `<tr><td style="color:#4a5568;font-size:13px;font-weight:600;">Megjegyzés</td><td style="color:#1a202c;font-weight:700;">${megjegyzes}</td></tr>` : ''}
                </table>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#4a5568;font-size:13px;text-align:center;">📅 Beérkezett: ${new Date().toLocaleString('hu-HU', {timeZone:'Europe/Budapest'})}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a2e;padding:24px 48px;text-align:center;">
            <p style="color:#a0aec0;font-size:12px;margin:0;">Robi &amp; Ricsi &amp; Norbi Kutyamenhely &bull; Belső admin értesítő</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
          });

          // User visszaigazoló email
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '🐾 Örökbefogadási jelentkezésed sikeresen beérkezett!',
            html: `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:56px 48px;text-align:center;">
            <div style="font-size:72px;margin-bottom:16px;">🐕‍🦺</div>
            <h1 style="color:#ffffff;margin:0;font-size:32px;font-weight:900;line-height:1.2;">Gratulálunk, ${user.felhasznalonev}!</h1>
            <p style="color:#a0aec0;margin:12px 0 0;font-size:16px;">Örökbefogadási kérelmed sikeresen beérkezett! 🎉</p>
          </td>
        </tr>
        <!-- PROGRESS -->
        <tr>
          <td style="background:#0f3460;padding:20px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" width="25%">
                  <div style="width:36px;height:36px;border-radius:50%;background:#e94560;margin:0 auto 6px;">
                    <span style="color:#fff;font-size:18px;font-weight:900;line-height:36px;display:block;text-align:center;">✓</span>
                  </div>
                  <p style="color:#ff8fa3;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;">Beérkezett</p>
                </td>
                <td align="center" width="25%">
                  <div style="width:36px;height:36px;border-radius:50%;background:transparent;margin:0 auto 6px;border:2px dashed #a0aec0;"></div>
                  <p style="color:#a0aec0;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;">Elbírálás</p>
                </td>
                <td align="center" width="25%">
                  <div style="width:36px;height:36px;border-radius:50%;background:transparent;margin:0 auto 6px;border:2px dashed #a0aec0;"></div>
                  <p style="color:#a0aec0;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;">Interjú</p>
                </td>
                <td align="center" width="25%">
                  <div style="width:36px;height:36px;border-radius:50%;background:transparent;margin:0 auto 6px;border:2px dashed #a0aec0;"></div>
                  <p style="color:#a0aec0;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;">Örökbefogadás!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:48px;">
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Kedves <strong style="color:#1a202c;">${user.felhasznalonev}</strong>,</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Rögzítettük az örökbefogadási kérelmedet! Ez egy hatalmas és csodálatos lépés – köszönjük, hogy megnyitod a szívedet és az otthonod egy kutyus előtt. 🐾❤️</p>
            <!-- Info box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#e94560,#c53030);border-radius:12px;padding:24px;">
                  <p style="color:#fff;font-size:14px;font-weight:800;margin:0 0 12px;letter-spacing:1px;text-transform:uppercase;">📋 A kérelem részletei</p>
                  <table width="100%">
                    <tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;width:140px;padding-bottom:6px;">Azonosítószám</td><td style="color:#fff;font-weight:700;padding-bottom:6px;">#${result.insertId}</td></tr>
                    <tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding-bottom:6px;">Város</td><td style="color:#fff;font-weight:700;padding-bottom:6px;">${varos}</td></tr>
                    <tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding-bottom:6px;">Státusz</td><td style="padding-bottom:6px;"><span style="background:rgba(255,255,255,0.25);color:#fff;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">⏳ Elbírálás alatt</span></td></tr>
                    <tr><td style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;">Beadva</td><td style="color:#fff;font-weight:700;">${new Date().toLocaleString('hu-HU', {timeZone:'Europe/Budapest'})}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Mi következik -->
            <p style="color:#1a202c;font-size:16px;font-weight:800;margin:0 0 16px;">🗓️ Mi következik?</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:14px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;border-radius:10px;padding:16px;">
                    <tr>
                      <td width="40" style="font-size:24px;vertical-align:top;">1️⃣</td>
                      <td style="vertical-align:top;"><strong style="color:#1a202c;font-size:14px;">Kérelem átvizsgálása</strong><br><span style="color:#4a5568;font-size:13px;">Csapatunk 2-3 munkanapon belül felülvizsgálja a kérelmedet.</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:14px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;border-radius:10px;padding:16px;">
                    <tr>
                      <td width="40" style="font-size:24px;vertical-align:top;">2️⃣</td>
                      <td style="vertical-align:top;"><strong style="color:#1a202c;font-size:14px;">Telefonos egyeztetés</strong><br><span style="color:#4a5568;font-size:13px;">Felvesszük veled a kapcsolatot a megadott telefonszámon: <strong>${telefonszam}</strong></span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;border-radius:10px;padding:16px;">
                    <tr>
                      <td width="40" style="font-size:24px;vertical-align:top;">3️⃣</td>
                      <td style="vertical-align:top;"><strong style="color:#1a202c;font-size:14px;">Személyes találkozó</strong><br><span style="color:#4a5568;font-size:13px;">Megismerkedsz a leendő kutyusoddal a menhelyen! 🐕</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- QUOTE -->
        <tr>
          <td style="background:#f7fafc;padding:32px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;padding:28px;text-align:center;">
                  <p style="color:#fff;font-size:17px;font-weight:700;margin:0;line-height:1.6;">"Egy kutya a legjobb barát,<br>akit valaha kaphatsz." 🐾</p>
                  <p style="color:rgba(255,255,255,0.88);font-size:13px;margin:10px 0 0;">— Robi, Ricsi &amp; Norbi csapata</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1a2e;padding:32px 48px;text-align:center;">
            <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 8px;">🐾 Robi &amp; Ricsi &amp; Norbi Kutyamenhely</p>
            <p style="color:#a0aec0;font-size:12px;margin:0;">Ez egy automatikus értesítő email. Kérjük, ne válaszolj erre az üzenetre.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
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

// --- DB migration: enum bővítése ---
db.query(`
  ALTER TABLE orokbefogadasok
  MODIFY COLUMN statusz ENUM('folyamatban','elbiralt','interju','elfogadva','elutasitva') DEFAULT 'folyamatban'
`, (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') {
    console.log('Enum migration:', err.code === 'ER_NO_SUCH_TABLE' ? 'tábla nem létezik' : 'OK vagy már frissítve');
  } else {
    console.log('Örökbefogadás státusz enum frissítve.');
  }
});

// --- Örökbefogadások listázása (admin) ---
app.get('/api/adoptions', (req, res) => {
  const sql = `
    SELECT o.id, o.statusz, o.letrehozva, o.telefonszam, o.varos, o.kutya_tapasztalat,
           f.felhasznalonev, f.email,
           k.nev AS kutya_nev
    FROM orokbefogadasok o
    JOIN felhasznalok f ON o.felhasznalo_id = f.felhasznalo_id
    LEFT JOIN kutyak k ON o.kutya_id = k.kutya_id
    ORDER BY o.letrehozva DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json(results);
  });
});

// --- Státusz váltás + email küldés ---
app.put('/api/adoption/:id/status', async (req, res) => {
  const { id } = req.params;
  const { statusz } = req.body;
  const ervenyes = ['folyamatban', 'elbiralt', 'interju', 'elfogadva', 'elutasitva'];
  if (!ervenyes.includes(statusz)) {
    return res.status(400).json({ error: 'Érvénytelen státusz!' });
  }

  db.query('UPDATE orokbefogadasok SET statusz = ? WHERE id = ?', [statusz, id], async (err) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });

    db.query(`
      SELECT o.id, o.varos, o.telefonszam,
             f.felhasznalonev, f.email,
             k.nev AS kutya_nev
      FROM orokbefogadasok o
      JOIN felhasznalok f ON o.felhasznalo_id = f.felhasznalo_id
      LEFT JOIN kutyak k ON o.kutya_id = k.kutya_id
      WHERE o.id = ?
    `, [id], async (err2, rows) => {
      if (err2 || rows.length === 0) return res.json({ success: true, message: 'Státusz frissítve, email nem küldve.' });

      const r = rows[0];

      const stepStyle = (active) => active
        ? `width:36px;height:36px;border-radius:50%;background:#e94560;margin:0 auto 6px;`
        : `width:36px;height:36px;border-radius:50%;background:transparent;border:2px dashed #a0aec0;margin:0 auto 6px;`;
      const stepText = (active) => active
        ? `color:#ff8fa3;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;`
        : `color:#a0aec0;font-size:11px;font-weight:700;margin:4px 0 0;text-transform:uppercase;`;
      const checkMark = (active) => active
        ? `<span style="color:#fff;font-size:18px;font-weight:900;line-height:36px;display:block;text-align:center;">✓</span>` : '';

      const steps = ['folyamatban', 'elbiralt', 'interju', 'elfogadva'];
      const stepIdx = steps.indexOf(statusz);

      const progressHTML = `
        <tr>
          <td style="background:#0f3460;padding:20px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" width="25%">
                  <div style="${stepStyle(stepIdx >= 0)}">${checkMark(stepIdx >= 0)}</div>
                  <p style="${stepText(stepIdx >= 0)}">Beérkezett</p>
                </td>
                <td align="center" width="25%">
                  <div style="${stepStyle(stepIdx >= 1)}">${checkMark(stepIdx >= 1)}</div>
                  <p style="${stepText(stepIdx >= 1)}">Elbírálás</p>
                </td>
                <td align="center" width="25%">
                  <div style="${stepStyle(stepIdx >= 2)}">${checkMark(stepIdx >= 2)}</div>
                  <p style="${stepText(stepIdx >= 2)}">Interjú</p>
                </td>
                <td align="center" width="25%">
                  <div style="${stepStyle(stepIdx >= 3)}">${checkMark(stepIdx >= 3)}</div>
                  <p style="${stepText(stepIdx >= 3)}">Örökbefogadás!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;

      const CONFIG = {
        elbiralt: {
          subject: `🔍 Kérelmed elbírálás alatt – #${r.id}`,
          emoji: '🔍', badge: '#f59e0b', badgeText: 'ELBÍRÁLÁS FOLYAMATBAN',
          title: `Elbírálás alatt állsz, ${r.felhasznalonev}!`,
          subtitle: 'Csapatunk most vizsgálja meg a kérelmedet 📋',
          body: `<p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Kedves <strong style="color:#1a202c;">${r.felhasznalonev}</strong>,</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Nagy örömmel tudatjuk, hogy a <strong style="color:#1a202c;">#${r.id}</strong> azonosítójú örökbefogadási kérelmed elbírálás alá kerül! Csapatunk alaposan áttekinti az általad megadott adatokat.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:24px;">
              <p style="color:#fff;font-size:14px;font-weight:800;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;">⏳ Mi történik most?</p>
              <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;line-height:1.6;">Munkatársaink átnézik a kérelmedet és 1-2 munkanapon belül felvesszük veled a kapcsolatot a <strong>${r.telefonszam}</strong> számon.</p>
            </td></tr></table>`
        },
        interju: {
          subject: `🤝 Személyes interjúra hívunk – #${r.id}`,
          emoji: '🤝', badge: '#7c3aed', badgeText: 'INTERJÚRA MEGHÍVVA',
          title: `Interjúra hívunk, ${r.felhasznalonev}!`,
          subtitle: 'Személyesen is megismernénk téged 🐾',
          body: `<p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Kedves <strong style="color:#1a202c;">${r.felhasznalonev}</strong>,</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Fantasztikus hír! A kérelmed sikeresen átment az első elbíráláson, és szeretnénk személyesen is megismerni téged – sőt, a leendő kutyusodat is bemutatnánk!</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:12px;padding:24px;">
              <p style="color:#fff;font-size:14px;font-weight:800;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;">📞 Következő lépés</p>
              <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;line-height:1.6;">Hamarosan felhívjuk a <strong>${r.telefonszam}</strong> telefonszámodat, hogy egyeztessük az interjú időpontját. Kérjük, tartsd kézben a telefont! 😊</p>
            </td></tr></table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f7fafc;border-radius:10px;padding:16px;"><table width="100%">
              <tr><td width="40" style="font-size:24px;vertical-align:top;">🐕</td><td style="vertical-align:top;"><strong style="color:#1a202c;font-size:14px;">Kutya: ${r.kutya_nev || 'Még nem kiválasztott'}</strong><br><span style="color:#4a5568;font-size:13px;">A látogatás során személyesen találkozhatsz leendő társaddal!</span></td></tr>
            </table></td></tr></table>`
        },
        elfogadva: {
          subject: `🎉 ÖRÖKBEFOGADÁS ELFOGADVA – #${r.id}`,
          emoji: '🎉', badge: '#059669', badgeText: 'KÉRELEM ELFOGADVA!',
          title: `Gratulálunk, ${r.felhasznalonev}!`,
          subtitle: 'Hamarosan egy új kutyus fog hozzád tartozni! 🐾❤️',
          body: `<p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Kedves <strong style="color:#1a202c;">${r.felhasznalonev}</strong>,</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Ez az a pillanat, amire vártál! 🥳 Örömmel és szívből gratulálunk – örökbefogadási kérelmedet <strong style="color:#059669;">ELFOGADTUK!</strong></p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="background:linear-gradient(135deg,#059669,#047857);border-radius:12px;padding:28px;text-align:center;">
              <p style="color:#fff;font-size:24px;font-weight:900;margin:0 0 8px;">🐶 ${r.kutya_nev || 'A kutyus'} hamarosan a Tiéd!</p>
              <p style="color:rgba(255,255,255,0.9);font-size:15px;margin:0;line-height:1.6;">Felvesszük veled a kapcsolatot a <strong>${r.telefonszam}</strong> számon az átvétel pontos időpontjának egyeztetéséhez.</p>
            </td></tr></table>
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#f0fdf4;border-radius:10px;padding:20px;border-left:4px solid #059669;">
              <p style="color:#065f46;font-size:14px;font-weight:700;margin:0 0 8px;">📋 Amit hozz magaddal az átvételhez:</p>
              <ul style="color:#4a5568;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
                <li>Személyi igazolvány</li><li>Aláírt örökbefogadási szerződés (helyszínen is kitölthető)</li><li>Kisállat szállítóbox vagy póráz</li>
              </ul>
            </td></tr></table>`
        },
        elutasitva: {
          subject: `📋 Kérelmeddel kapcsolatos frissítés – #${r.id}`,
          emoji: '💙', badge: '#6b7280', badgeText: 'KÉRELEM LEZÁRVA',
          title: `Tájékoztatás a kérelmedről`,
          subtitle: `Köszönjük a jelentkezésedet, ${r.felhasznalonev}`,
          body: `<p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Kedves <strong style="color:#1a202c;">${r.felhasznalonev}</strong>,</p>
            <p style="color:#4a5568;font-size:16px;line-height:1.8;margin:0 0 20px;">Köszönjük, hogy időt és energiát fordítottál örökbefogadási kérelemre, és hogy fontolóra vetted, hogy egy kutyusnak új otthont adj. Ez önmagában már egy nemes cselekedet. 💙</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;"><tr><td style="background:#f3f4f6;border-radius:12px;padding:24px;border-left:4px solid #6b7280;">
              <p style="color:#374151;font-size:15px;margin:0;line-height:1.7;">Sajnálatos módon ezúttal a <strong>#${r.id}</strong> azonosítójú kérelmedet nem tudtuk elfogadni. Ez nem jelenti azt, hogy a jövőben ne próbálkozhatnál újra, vagy ne segíthetnél más módon – például önkéntesként nálunk! 🐾</p>
            </td></tr></table>
            <p style="color:#4a5568;font-size:15px;line-height:1.8;margin:0;">Ha kérdésed van, keress minket bátran! Minden megkeresésre válaszolunk.</p>`
        }
      };

      const cfg = CONFIG[statusz];
      if (!cfg) return res.json({ success: true, message: 'Státusz frissítve, ehhez a státuszhoz nem küldünk emailt.' });

      const htmlEmail = `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:48px;text-align:center;">
            <div style="font-size:64px;margin-bottom:12px;">${cfg.emoji}</div>
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;line-height:1.2;">${cfg.title}</h1>
            <p style="color:#a0aec0;margin:10px 0 0;font-size:15px;">${cfg.subtitle}</p>
          </td>
        </tr>
        <tr><td style="background:${cfg.badge};padding:10px 48px;text-align:center;">
          <p style="color:#fff;margin:0;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">${cfg.badgeText}</p>
        </td></tr>
        ${progressHTML}
        <tr><td style="padding:40px 48px;">${cfg.body}</td></tr>
        <tr>
          <td style="background:#f7fafc;padding:28px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;padding:24px;text-align:center;">
                <p style="color:#fff;font-size:16px;font-weight:700;margin:0;line-height:1.6;">"Egy kutya a legjobb barát,<br>akit valaha kaphatsz." 🐾</p>
                <p style="color:rgba(255,255,255,0.88);font-size:13px;margin:10px 0 0;">— Robi, Ricsi &amp; Norbi csapata</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a2e;padding:28px 48px;text-align:center;">
            <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 6px;">🐾 Robi &amp; Ricsi &amp; Norbi Kutyamenhely</p>
            <p style="color:#a0aec0;font-size:12px;margin:0;">Ez egy automatikus értesítő email. Kérjük, ne válaszolj erre az üzenetre.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: r.email,
          subject: cfg.subject,
          html: htmlEmail
        });
        res.json({ success: true, message: `Státusz frissítve és email elküldve (${statusz}).` });
      } catch (emailErr) {
        console.error('Státusz email hiba:', emailErr);
        res.json({ success: true, message: 'Státusz frissítve, de az email küldése sikertelen.' });
      }
    });
  });
});

// --- Index oldal ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Szerver fut a 3000-es porton'));