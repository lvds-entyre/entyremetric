// database/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

module.exports = db;
