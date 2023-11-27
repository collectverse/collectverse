const express = require('express');
const router = express.Router();
const PublicationsController = require('../controllers/publicationsController');

// routes
router.get('/home', PublicationsController.showHome);
router.post('/post', PublicationsController.post)

module.exports = router