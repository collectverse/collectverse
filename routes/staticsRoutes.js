const express = require('express');
const router = express.Router();
const StaticsController = require('../controllers/StaticsController');

router.get('/terms', StaticsController.terms);
router.get('/lading', StaticsController.lading);

module.exports = router