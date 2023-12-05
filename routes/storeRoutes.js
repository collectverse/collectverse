const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/StoreControler');

router.get('/', StoreController.showStore)
router.get('/item/:id', StoreController.showitem)
router.get('/pass', StoreController.showPass)
router.get('/get', StoreController.get)
router.post('/addToCart', StoreController.addToCart)
router.post('/removeToCart', StoreController.removeToCart)

module.exports = router