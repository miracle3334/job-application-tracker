//Setting up an API for the application DB

//importing express/sqlite3 libraries
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// built-in Node.js module for correctly building the file paths
const path = require('path');

//creating an Express instance
const app = express();

//setting backend server port
const PORT = 3000;

//absolute path for the SQLiteDB file
const dbPath = path.resolve(__dirname, '../job_tracker.db');

app.use(express.json());

//opening connection to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if(err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

//test data
db.get("SELECT COUNT(*) as count FROM applications", (err, row) => {
  if (err) {
    console.error(err.message);
    return;
  }
  if (row.count === 0) {
    const insert = 'INSERT INTO applications (company, position, status) VALUES (?, ?, ?)';
    db.run(insert, ['Company1', 'Backend Developer', 'Applied']);
    db.run(insert, ['Company2', 'Frontend Developer', 'Interview']);
    db.run(insert, ['Company3', 'Full Stack Developer', 'Rejected']);
    console.log("Test data inserted into applications table.");
  }
});

//middleware to let Express parse incoming JSON requests. Needed for POST/PUT actions
app.use(express.json());

app.get('/applications', (req, res) => {
  db.all('SELECT * FROM applications', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/applications', (req, res) => {
  const { company, position, date_applied, status, notes } = req.body;
  

  const insert = 'INSERT INTO applications (company, position, date_applied, status, notes) VALUES (?, ?, ?, ?, ?)';
  
  db.run(insert, [company, position, date_applied, status, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, company, position, date_applied, status, notes });
  });
});

//starting the server and listening on port 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});