const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController.js');

router.get('/', StoreController.store);
router.get('/shopping/:id', StoreController.itemShow);
router.post('/get', StoreController.getItem);
router.post('/getUniverse', StoreController.getUniverse)
router.get('/points', StoreController.points)

module.exports = router;