const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.get('/access', AuthController.access);
router.post('/login', AuthController.login)
router.post('/register', AuthController.register)
router.get('/logout', AuthController.logout);

module.exports = router