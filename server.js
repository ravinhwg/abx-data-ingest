const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// PostgreSQL Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// API to save data
app.post('/api/save-data', async (req, res) => {
    const { issue_date, antibiotic_name, ward_name, quantity } = req.body;
    try {
        await pool.query(
            'INSERT INTO drug_issues (issue_date, antibiotic_name, ward_name, quantity, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [issue_date, antibiotic_name, ward_name, quantity]
        );
        res.status(201).send('Data saved successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving data');
    }
});

// API to fetch paginated data
app.get('/api/get-data', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const query = 'SELECT * FROM drug_issues ORDER BY timestamp DESC LIMIT $1 OFFSET $2';
        const result = await pool.query(query, [limit, offset]);

        const countResult = await pool.query('SELECT COUNT(*) AS total FROM drug_issues');
        const total = parseInt(countResult.rows[0].total, 10);

        res.status(200).json({
            data: result.rows,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching paginated data');
    }
});

// API to update data
app.put('/api/update-data/:id', async (req, res) => {
    const { id } = req.params;
    const { issue_date, antibiotic_name, ward_name, quantity } = req.body;

    try {
        await pool.query(
            'UPDATE drug_issues SET issue_date = $1, antibiotic_name = $2, ward_name = $3, quantity = $4 WHERE id = $5',
            [issue_date, antibiotic_name, ward_name, quantity, id]
        );
        res.status(200).send('Data updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating data');
    }
});

// API to delete data
app.delete('/api/delete-data/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM drug_issues WHERE id = $1', [id]);
        res.status(200).send('Data deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting data');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
