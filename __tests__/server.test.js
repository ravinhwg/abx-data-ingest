const request = require('supertest');
const { exec } = require('child_process');
const { app, db, server } = require('../server');



afterAll((done) => {
    server.close(() => {
        db.close();
        done();
    });
});

describe('API Tests', () => {
    test('POST /api/save-data should save data', async () => {
        const response = await request(app)
            .post('/api/save-data')
            .send({
                issue_date: '2123-10-01',
                antibiotic_name: 'JEST TEST',
                ward_name: 'Ward A',
                quantity: 10
            });
        expect(response.status).toBe(201);
        expect(response.text).toBe('Data saved successfully');
    });

    test('GET /api/get-data should fetch paginated data', async () => {
        const response = await request(app).get('/api/get-data?page=1&limit=10');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('currentPage', 1);
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body).toHaveProperty('totalItems');
    });

    test('PUT /api/update-data/:id should update data', async () => {
        const response = await request(app)
            .put('/api/update-data/1')
            .send({
                issue_date: '2023-10-02',
                antibiotic_name: 'JEST TEST UPDATE',
                ward_name: 'Ward B',
                quantity: 20
            });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Data updated successfully');
    });

    test('DELETE /api/delete-data/:id should delete data', async () => {
        const response = await request(app).delete('/api/delete-data/1');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Data deleted successfully');
    });
});
