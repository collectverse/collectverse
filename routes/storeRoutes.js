const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/StoreControler');

router.get('/', StoreController.showStore)
router.get('/pass', StoreController.showPass)
router.get('/pass/get', StoreController.getPass)

module.exports = router