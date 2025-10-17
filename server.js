const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//  statikus fájlok kiszolgálása
app.use(express.static(path.join(__dirname, 'public'))); 

// MySQL kapcsolat
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

// POST végpont
app.post('/visszajelzes', (req, res) => {
  const { email, szoveg } = req.body;
  if (!email || !szoveg) return res.status(400).json({ error: 'Hiányzó adatok!' });

  const sql = 'INSERT INTO visszajelzesek (email, uzenet) VALUES (?, ?)';
  db.query(sql, [email, szoveg], err => {
    if (err) return res.status(500).json({ error: 'Adatbázis hiba!' });
    res.json({ message: 'Sikeres mentés!' });
  });
});

// GET alap route – ez megoldja a "Cannot GET /" hibát
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Szerver indítása
app.listen(3000, () => {
  console.log('Szerver fut a 3000-es porton');
});
