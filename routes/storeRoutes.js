const express = require('express');
const router = express.Router();
const signController = require('../controllers/storeController.js');

router.get('/', signController.store);
router.get('/shopping/:id', signController.itemShow);

module.exports = router;