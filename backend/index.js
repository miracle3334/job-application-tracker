//Setting up an API for the application DB

//importing express/sqlite3 libraries
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// built-in Node.js module for correctly building the file paths
const path = require('path');

//creating an Express instance
const app = express();

//setting backend server port
const PORT = 3000;

//absolute path for the SQLiteDB file
const dbPath = path.resolve(__dirname, '../job_tracker.db');

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

//open connection to the database
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

//Read data
app.get('/applications', (req, res) => {
  db.all('SELECT * FROM applications', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});


//Create new data
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

// UPDATE an application (PATCH)
app.patch('/applications/:id', (req, res) => {
  const { id } = req.params;
  const { company, position, date_applied, status, notes } = req.body;

  const fields = [];
  const values = [];

  if (company) {
    fields.push("company = ?");
    values.push(company);
  }
  if (position) {
    fields.push("position = ?");
    values.push(position);
  }
  if (date_applied) {
    fields.push("date_applied = ?");
    values.push(date_applied);
  }
  if (status) {
    fields.push("status = ?");
    values.push(status);
  }
  if (notes) {
    fields.push("notes = ?");
    values.push(notes);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const sql = `UPDATE applications SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Application updated", changes: this.changes });
  });
});

// DELETE a job application by ID
app.delete("/applications/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM applications WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting application:", err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Application not found" });
    } else {
      res.json({ message: "Application deleted successfully" });
    }
  });
});

//start the server and listening on port 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});