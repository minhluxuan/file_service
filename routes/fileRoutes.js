const express = require('express');
const DiskStorage = require("../models/DiskStorage");
const fileController = require("../controllers/fileController");

const router = express.Router();

const diskStorage = new DiskStorage("file", 100 * 1024 * 1024, 256, "../uploads/temp", "../uploads/main");

router.get("/", fileController.get);
router.post("/upload", diskStorage.upload.single(diskStorage.fieldName), fileController.upload);
router.delete("/delete", fileController.remove);

module.exports = router;