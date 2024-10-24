const express = require('express');
const router = express.Router();
const SignController = require('../controllers/signController.js');

router.get('/in', SignController.signIn);
router.post('/makeSignIn', SignController.makeSignIn);
router.get('/up', SignController.signUp);
router.post('/makeSignUp', SignController.makeSignUp);
router.get('/logout', SignController.logout);
router.get('/recover', SignController.recover);
router.post('/makeRecover', SignController.makeRecover);
router.get('/verify', SignController.verify);
router.get('/verifyToken', SignController.verifyToken);

module.exports = router;