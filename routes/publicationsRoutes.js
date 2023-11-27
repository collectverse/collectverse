const express = require('express');
const router = express.Router();
const PublicationsController = require('../controllers/publicationsController');

// routes
router.get('/home', PublicationsController.showHome);
router.post('/post', PublicationsController.post)
router.post('/delete', PublicationsController.delete)

module.exports = router