const request = require('supertest');
const server = require('../server'); // Adjust the path as needed
const chai = require('chai');
const expect = chai.expect;

describe('API Integration Tests', () => {

    beforeEach(() => {
        server.initializeDatabase();
    });

    it('should fetch paginated data', (done) => {

        request(server.app)
            .get('/api/get-data?page=1&limit=10')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('data');
                expect(res.body).to.have.property('currentPage', 1);
                expect(res.body).to.have.property('totalPages');
                expect(res.body).to.have.property('totalItems');
                done();
            });
    });

    // Add more integration tests for other endpoints
});
