// database/migration.js
const db = require('./database');

const migrate = () => {
    db.run(`
        ALTER TABLE metrics ADD COLUMN is_above_good BOOLEAN NOT NULL DEFAULT 1;
    `, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "is_above_good" already exists.');
            } else {
                console.error('Error adding "is_above_good" column:', err.message);
            }
        } else {
            console.log('Successfully added "is_above_good" column to metrics table.');
        }
    });
};

module.exports = migrate;
