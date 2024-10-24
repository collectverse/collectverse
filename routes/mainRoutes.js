const express = require('express');
const router = express.Router();
const storage = require("../helpers/storage.js")
const upload = storage;
const MainController = require('../controllers/mainController.js');

router.get("/", MainController.home);
router.post("/publish", upload.fields([{ name: "image", maxCount: 1 }]), MainController.publish);
router.post("/publish/del/:id", MainController.deletePublication);
router.post("/likePublication", MainController.likePublication);
router.get("/publication/:id", MainController.publication)
router.get("/search", MainController.search)
router.post("/search", MainController.makeSearch)

module.exports = router;