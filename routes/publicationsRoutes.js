const express = require('express');
const router = express.Router();
const PublicationsController = require('../controllers/publicationsController');

// helpers

// routes
router.get('/home', PublicationsController.showHome);

module.exports = router