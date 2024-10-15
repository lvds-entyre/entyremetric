// routes/metricRoutes.js
const express = require('express');
const router = express.Router();
const Metric = require('../models/metric');

// Get all metrics
router.get('/', (req, res) => {
    Metric.getAll((err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Create a new metric
router.post('/', (req, res) => {
    const { name, description, team, country, is_above_good } = req.body;
    
    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: 'Metric name is required.' });
    }
    
    // Default is_above_good to true if not provided
    const isAboveGood = is_above_good !== undefined ? is_above_good : true;

    Metric.create(name, description, team, country, isAboveGood, function (err, result) {
        if (err) return res.status(500).send(err.message);
        // Return the created metric with its ID
        res.status(201).json({ id: result.id, name, description, team, country, is_above_good: isAboveGood });
    });
});

// Get a specific metric by ID
router.get('/:id', (req, res) => {
    Metric.getById(req.params.id, (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json(row);
    });
});

// Update a metric by ID
router.put('/:id', (req, res) => {
    const { name, description, team, country, is_above_good } = req.body;
    
    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: 'Metric name is required.' });
    }
    
    // Default is_above_good to true if not provided
    const isAboveGood = is_above_good !== undefined ? is_above_good : true;

    Metric.update(req.params.id, name, description, team, country, isAboveGood, (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ id: req.params.id, name, description, team, country, is_above_good: isAboveGood });
    });
});

// Delete a metric by ID
router.delete('/:id', (req, res) => {
    Metric.delete(req.params.id, (err) => {
        if (err) return res.status(500).send(err.message);
        res.send('Metric deleted');
    });
});

module.exports = router;
