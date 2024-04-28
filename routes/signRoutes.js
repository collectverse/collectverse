const express = require('express');
const router = express.Router();
const signController = require('../controllers/signController.js');

router.get('/in', signController.signIn);
router.post('/makeSignIn', signController.makeSignIn);
router.get('/up', signController.signUp);
router.post('/makeSignUp', signController.makeSignUp);
router.get('/logout', signController.logout);
router.get('/recover', signController.recover);
router.post('/makeRecover', signController.makeRecover);

module.exports = router;