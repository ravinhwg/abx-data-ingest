const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDbPath = path.join(__dirname, 'abx-data-test.sqlite');

try {
    console.log('Seeding the database...');
    execSync('NODE_ENV=test npm run seed', { stdio: 'inherit' });
    console.log('Database seeded successfully.');
} catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
}

afterAll(() => {
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log('Test database file deleted.');
    }
});
