const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const unzipper = require("unzipper");
const archiver = require("archiver");
const DiskStorage = require("../models/DiskStorage");
const fileController = require("../controllers/fileController");
const HttpStatus = require('../models/HttpStatus');

const router = express.Router();

// Configure Multer to store uploaded files in 'uploads' folder
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads';
//         fs.mkdirSync(uploadPath, { recursive: true });
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

const diskStorage = new DiskStorage("file", ["image/jpg", "image/jpeg", "image/png"], 5 * 1024 * 1024, 256, "../uploads/temp_file", "../uploads/file");

router.get("/", diskStorage.upload.single(diskStorage.fieldName), fileController.get);
router.post("/upload", diskStorage.upload.single(diskStorage.fieldName), fileController.upload);
router.delete('/delete', fileController.remove);

module.exports = router;