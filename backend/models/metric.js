// models/metric.js
const db = require('../database/database');

const Metric = {
    createTable: () => {
        db.run(`
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                team TEXT,         -- New field
                country TEXT,      -- New field
                is_above_good INTEGER DEFAULT 1 -- 1 for true (above is good), 0 for false (below is good)
            )
        `);
    },
    create: (name, description, team, country, isAboveGood, callback) => {
        const sql = 'INSERT INTO metrics (name, description, team, country, is_above_good) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [name, description, team, country, isAboveGood ? 1 : 0], function(err) {
            if (err) {
                return callback(err);
            }
            // Return the last inserted ID
            callback(null, { id: this.lastID });
        });
    },
    getAll: (callback) => {
        db.all('SELECT * FROM metrics', [], callback);
    },
    getById: (id, callback) => {
        db.get('SELECT * FROM metrics WHERE id = ?', [id], callback);
    },
    update: (id, name, description, team, country, isAboveGood, callback) => {
        const sql = 'UPDATE metrics SET name = ?, description = ?, team = ?, country = ?, is_above_good = ? WHERE id = ?';
        db.run(sql, [name, description, team, country, isAboveGood ? 1 : 0, id], callback);
    },
    delete: (id, callback) => {
        db.run('DELETE FROM metrics WHERE id = ?', [id], callback);
    }
};

module.exports = Metric;
