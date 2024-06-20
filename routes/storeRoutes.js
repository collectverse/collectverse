const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController.js');

router.get('/', storeController.store);
router.get('/shopping/:id', storeController.itemShow);
router.post('/get', storeController.getItem);
router.post('/getUniverse', storeController.getUniverse)

module.exports = router;