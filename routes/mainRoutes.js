const express = require('express');
const router = express.Router();
const storage = require("../helpers/storage")
const upload = storage;
const MainController = require('../controllers/mainController');

router.get("/", MainController.home);
router.post("/publish", upload.fields([{ name: "image", maxCount: 1 }]), MainController.publish);
router.post("/publish/del/:id", MainController.deletePublication);
router.post("/likePublication", MainController.likePublication);
router.get("/publication/:id", MainController.publication)

module.exports = router;