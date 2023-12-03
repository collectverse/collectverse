const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');

router.get('/user/:id', PerfilController.showUser);

module.exports = router