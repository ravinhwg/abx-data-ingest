const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config();

const dbFilePath = process.env.NODE_ENV === 'test' ? './abx-data-test.sqlite' : './abx-data.sqlite';

// Delete the test database if it already exists
if (process.env.NODE_ENV === 'test' && fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath);
}

const db = new sqlite3.Database(dbFilePath);

const seedData = [
    {
        issue_date: '2025-01-06',
        antibiotic_name: 'Amoxicillin seed',
        ward_name: 'WD1',
        quantity: 10
    },
    {
        issue_date: '2025-01-07',
        antibiotic_name: 'Ciprofloxacin seed',
        ward_name: 'WD2',
        quantity: 20
    },
    {
        issue_date: '2025-01-08',
        antibiotic_name: 'Doxycycline seed',
        ward_name: 'WD3',
        quantity: 30
    }
];

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS drug_issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_date TEXT,
            antibiotic_name TEXT,
            ward_name TEXT,
            quantity INTEGER,
            timestamp TEXT
        )
    `);

    // Seed the database with some data if not on production
    if (process.env.NODE_ENV !== 'prod') {
        const stmt = db.prepare(`
            INSERT INTO drug_issues (issue_date, antibiotic_name, ward_name, quantity, timestamp)
            VALUES (?, ?, ?, ?, datetime('now'))
        `);

        seedData.forEach((data) => {
            stmt.run(data.issue_date, data.antibiotic_name, data.ward_name, data.quantity);
        });

        stmt.finalize();
    }
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log(`Database seeded successfully in ${process.env.NODE_ENV === 'test' ? 'abx-data-test.sqlite' : 'abx-data.sqlite'}`);
});
