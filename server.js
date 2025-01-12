const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

require('dotenv').config();

const db = new sqlite3.Database(process.env.NODE_ENV === "prod" ? "./abx-data.sqlite" : ":memory:");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Function to initialize the database schema
function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS drug_issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_date TEXT,
            antibiotic_name TEXT,
            ward_name TEXT,
            quantity INTEGER,
            timestamp TEXT
        )
    `;
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        }
    });
}

// API to save data
app.post('/api/save-data', (req, res) => {
    const { issue_date, antibiotic_name, ward_name, quantity } = req.body;
    const query = `INSERT INTO drug_issues (issue_date, antibiotic_name, ward_name, quantity, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`;
    db.run(query, [issue_date, antibiotic_name, ward_name, quantity], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving data');
        } else {
            res.status(201).send('Data saved successfully');
        }
    });
});

// API to fetch paginated data
app.get('/api/get-data', (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM drug_issues ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    db.all(query, [limit, offset], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching paginated data');
        } else {
            db.get('SELECT COUNT(*) AS total FROM drug_issues', (err, countResult) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error fetching paginated data');
                } else {
                    const total = countResult.total;
                    res.status(200).json({
                        data: rows,
                        currentPage: parseInt(page, 10),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                    });
                }
            });
        }
    });
});

// API to update data
app.put('/api/update-data/:id', (req, res) => {
    const { id } = req.params;
    const { issue_date, antibiotic_name, ward_name, quantity } = req.body;
    const query = `UPDATE drug_issues SET issue_date = ?, antibiotic_name = ?, ward_name = ?, quantity = ? WHERE id = ?`;
    db.run(query, [issue_date, antibiotic_name, ward_name, quantity, id], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
        } else {
            res.status(200).send('Data updated successfully');
        }
    });
});

// API to delete data
app.delete('/api/delete-data/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM drug_issues WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting data');
        } else {
            res.status(200).send('Data deleted successfully');
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} on ${process.env.NODE_ENV === "prod" ? "PRODUCTION" : process.env.NODE_ENV === "test" ? "TESTING": "DEVELOPMENT"} mode`);
});

module.exports = { app, db, initializeDatabase };
