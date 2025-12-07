const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Choose controller based on environment variable
const USE_DATABASE = process.env.USE_DATABASE === 'true';

let controller;
if (USE_DATABASE) {
    // Use Supabase controller (simpler, uses Supabase JS client)
    controller = require('../controllers/salesController.supabase');
    console.log('📦 Using Supabase database');
} else {
    // Use CSV controller (original)
    controller = require('../controllers/salesController');
    console.log('📄 Using CSV file');
}

const { getSales } = controller;

const router = express.Router();

router.get('/', getSales);

module.exports = router;
