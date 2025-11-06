const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/kutyak'); // ide kerülnek a képek
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// az upload változó, amit a route‑ban használsz
const upload = multer({ storage: storage });


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

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


app.post('/visszajelzes', (req, res) => {
  const { email, szoveg } = req.body;
  if (!email || !szoveg) return res.status(400).json({ error: 'Hiányzó adatok!' });

  const sql = 'INSERT INTO visszajelzesek (email, uzenet) VALUES (?, ?)';
  db.query(sql, [email, szoveg], err => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json({ message: 'Sikeres mentés!' });
  });
});


// <<< EZT A RÉSZT MÓDOSÍTOTTAM >>>
app.post('/kutyak', upload.single('kep'), (req, res) => {
  const { nev, eletkor, nem, fajta } = req.body; // fajta szövegesen
  if (!nev || !fajta) return res.status(400).json({ error: 'Hiányzó adatok!' });

  const kepUrl = req.file ? '/img/kutyak/' + req.file.filename : null;

  // Ellenőrizzük, hogy létezik-e a fajta
  const checkFajta = 'SELECT fajta_id FROM fajtak WHERE nev = ? LIMIT 1';
  db.query(checkFajta, [fajta], (err, results) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba fajta ellenőrzésnél!' });

    if (results.length > 0) {
      // Már létezik a fajta
      const fajta_id = results[0].fajta_id;
      insertKutya(nev, eletkor, nem, fajta_id, kepUrl, res);
    } else {
      // Új fajta beszúrása
      const insertFajta = 'INSERT INTO fajtak (nev) VALUES (?)';
      db.query(insertFajta, [fajta], (err2, result2) => {
        if (err2) return res.status(500).json({ error: 'Adatbázis hiba fajta beszúrásnál!' });
        const fajta_id = result2.insertId;
        insertKutya(nev, eletkor, nem, fajta_id, kepUrl, res);
      });
    }
  });
});

// Segédfüggvény a kutya beszúrásához
function insertKutya(nev, eletkor, nem, fajta_id, kepUrl, res) {
  const sql = 'INSERT INTO kutyak (nev, eletkor, nem, fajta_id, kep_url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nev, eletkor || null, nem || null, fajta_id, kepUrl], err => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba kutya beszúrásnál!' });
    res.json({ message: 'Kutya sikeresen hozzáadva!' });
  });
}
// <<< IDÁIG >>>



app.get('/kutyak', (req, res) => {
  const sql = `
    SELECT k.kutya_id, 
           k.nev, 
           k.eletkor, 
           k.nem, 
           f.nev AS fajta, 
           k.erkezes_datum, 
           k.kep_url
    FROM kutyak k
    LEFT JOIN fajtak f ON k.fajta_id = f.fajta_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Adatbázis hiba!' });
    }
    res.json(results);
  });
});


app.get('/orokbefogadok', (req, res) => {
  db.query('SELECT * FROM orokbefogadok', (err, results) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json(results);
  });
});


app.post('/adomany', (req, res) => {
  const { orokbefogado_id, datum, osszeg, targy } = req.body;
  if (!datum || (!osszeg && !targy))
    return res.status(400).json({ error: 'Hiányzó adatok!' });

  const sql = 'INSERT INTO adomanyok (orokbefogado_id, datum, osszeg, targy) VALUES (?, ?, ?, ?)';
  db.query(sql, [orokbefogado_id || null, datum, osszeg || null, targy || null], err => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json({ message: 'Adomány sikeresen rögzítve!' });
  });
});


app.get('/orvosi', (req, res) => {
  const sql = `
    SELECT o.vizsgalat_id, k.nev AS kutya_nev, o.datum, o.kezeles, o.allatorvos
    FROM orvosi_vizsgalatok o
    JOIN kutyak k ON o.kutya_id = k.kutya_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json(results);
  });
});

// Örökbefogadás feldolgozása
app.post('/orokbefogadas', (req, res) => {
  const { nev, telefonszam, cim, kutya_id } = req.body;

  // 1. Új örökbefogadó beszúrása
  const sql1 = 'INSERT INTO menhely_orokbefogadok (nev, telefonszam, email) VALUES (?, ?, ?)';
  db.query(sql1, [nev, telefonszam, null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Hiba az örökbefogadó mentésénél!' });

    const orokbefogadoId = result.insertId;

    // 2. Örökbefogadás rögzítése
    const sql2 = 'INSERT INTO menhely_orokbefogadasok (kutya_id, orokbefogado_id, datum) VALUES (?, ?, CURDATE())';
    db.query(sql2, [kutya_id, orokbefogadoId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Hiba az örökbefogadás mentésénél!' });

      // 3. Kutya rekord frissítése (beállítjuk az örökbefogadó_id-t)
      const sql3 = 'UPDATE menhely_kutyak SET orokbefogado_id = ? WHERE kutya_id = ?';
      db.query(sql3, [orokbefogadoId, kutya_id], (err3) => {
        if (err3) return res.status(500).json({ message: 'Hiba a kutya frissítésénél!' });

        res.json({ message: 'Örökbefogadás sikeresen rögzítve!' });
      });
    });
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => {
  console.log('Szerver fut a 3000-es porton');
});
