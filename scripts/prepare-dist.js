const fs = require('fs');
const path = require('path');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy required files
fs.copyFileSync('.env.example', 'dist/.env');
fs.copyFileSync('abx-data.sqlite', 'dist/abx-data.sqlite');
