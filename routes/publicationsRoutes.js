const express = require('express');
const router = express.Router();
const PublicationsController = require('../controllers/publicationsController');

// routes
router.get('/home', PublicationsController.showHome);
router.post('/postComment', PublicationsController.postComment)

module.exports = router