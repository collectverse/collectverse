const express = require('express');
const multer = require('multer');
const router = express.Router();
const storage = require("../helpers/storage.js")
const upload = storage;
const ProfileController = require('../controllers/profileController.js');

router.get("/:id", ProfileController.profile);
router.get("/:id/edit", ProfileController.edit);
router.post("/edit", upload.fields([{ name: "perfil", maxCount: 1 }, { name: "banner", maxCount: 1 }]), ProfileController.makeEdit);
router.post("/alter/password", ProfileController.alterPassword);
router.post("/del/account", ProfileController.deleteAccount);
router.post("/follows", ProfileController.follows);

module.exports = router;