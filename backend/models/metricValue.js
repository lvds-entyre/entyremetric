// models/metricValue.js
const db = require('../database/database');

const MetricValue = {
    createTable: () => {
        db.run(`
            CREATE TABLE IF NOT EXISTS metric_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_id INTEGER NOT NULL,
                value REAL NOT NULL,
                week_start TEXT NOT NULL,  -- ISO 8601 format (YYYY-MM-DD)
                FOREIGN KEY (metric_id) REFERENCES metrics (id)
            )
        `);
    },
    create: (metric_id, value, week_start, callback) => {
        const sql = 'INSERT INTO metric_values (metric_id, value, week_start) VALUES (?, ?, ?)';
        db.run(sql, [metric_id, value, week_start], callback);
    },
    getAllByMetric: (metric_id, callback) => {
        const sql = 'SELECT * FROM metric_values WHERE metric_id = ? ORDER BY week_start';
        db.all(sql, [metric_id], callback);
    },
    // New method to get metric values by metric IDs and weeks
    getByMetricsAndWeeks: (metricIdsArray, weeksArray, callback) => {
        const metricPlaceholders = metricIdsArray.map(() => '?').join(',');
        const weekPlaceholders = weeksArray.map(() => '?').join(',');
        const sql = `
            SELECT * FROM metric_values
            WHERE metric_id IN (${metricPlaceholders})
            AND week_start IN (${weekPlaceholders})
            ORDER BY metric_id, week_start
        `;
        const params = [...metricIdsArray, ...weeksArray];
        db.all(sql, params, callback);
    },
    update: (id, value, week_start, callback) => {
        const sql = 'UPDATE metric_values SET value = ?, week_start = ? WHERE id = ?';
        db.run(sql, [value, week_start, id], callback);
    },
    delete: (id, callback) => {
        db.run('DELETE FROM metric_values WHERE id = ?', [id], callback);
    }
};

module.exports = MetricValue;
