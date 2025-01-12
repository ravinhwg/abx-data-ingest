const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sqlite3 = require('sqlite3').verbose();
const server = require('../server'); // Adjust the path as needed

describe('Server Tests', () => {
    let db;

    beforeEach(() => {
        server.initializeDatabase();
        db = new sqlite3.Database(':memory:');
        sinon.stub(server, 'db').value(db);
    });

    afterEach(() => {
        db.close();
        sinon.restore();
    });

    it('should save data correctly', (done) => {
        const data = {
            issue_date: '2025-01-06',
            antibiotic_name: 'Amoxicillin TEST',
            ward_name: 'WD1',
            quantity: 10
        };

        server.app.post('/api/save-data', (req, res) => {
            expect(req.body).to.deep.equal(data);
            done();
        });

        // Simulate a request
        const request = require('supertest');
        request(server.app)
            .post('/api/save-data')
            .send(data)
            .expect(201, done);
    });

    // Add more unit tests for other endpoints and functions

});
