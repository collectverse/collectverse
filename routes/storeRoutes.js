const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController.js');

router.get('/', StoreController.store);
router.get('/shopping/:id', StoreController.itemShow);
router.post('/get', StoreController.getItem);
router.post('/getPass', StoreController.getPass);
router.get('/points', StoreController.points);
router.post('/getPoints', StoreController.getPoints);
router.post('/startChallenge', StoreController.startChallenge);
router.post('/declineChallenge', StoreController.declineChallenge);
router.get('/buy/points/:id', StoreController.pointsShow);
router.get('/redeemChallenge', StoreController.redeemChallenge);

module.exports = router;