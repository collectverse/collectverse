const express = require('express');
const router = express.Router();
const signController = require('../controllers/storeController');

router.get('/', signController.store);

module.exports = router;