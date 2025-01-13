const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const net = require('net');

require('dotenv').config();

const db = new sqlite3.Database(
  process.env.NODE_ENV === "test" ? "abx-data-test.sqlite" : "./abx-data.sqlite"
);
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Function to get random available port
const getRandomPort = () => {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(port);
            });
        });
    });
};

// API to save data
app.post('/api/save-data', (req, res) => {
    const { issue_date, antibiotic_name, ward_name, quantity } = req.body;
    const query = `INSERT INTO drug_issues (issue_date, antibiotic_name, ward_name, quantity, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`;
    db.run(query, [issue_date, antibiotic_name, ward_name, quantity], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving data');
        } else {
            res.status(200).send('Data saved successfully');
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

// Modify server start
const startServer = async () => {
    try {
        const randomPort = await getRandomPort();
        const server = app.listen(randomPort, async () => {
            const serverUrl = `http://localhost:${randomPort}`;
            console.log(`Server running at ${serverUrl} on ${
                process.env.NODE_ENV === "test" ? "TESTING" : "PRODUCTION"
            } mode`);

            // Launch browser
            if (process.env.NODE_ENV !== "test") {
                const open = (await import('open')).default;
                open(serverUrl);
            }
        });
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Initialize server
(async () => {
    const server = await startServer();
    module.exports = { app, server, db, startServer };
})();
