const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController.js');

router.get('/in', signController.signIn);
router.post('/makeSignIn', signController.makeSignIn);
router.get('/up', signController.signUp);
router.post('/makeSignUp', signController.makeSignUp);
router.get('/logout', signController.logout);

module.exports = router;