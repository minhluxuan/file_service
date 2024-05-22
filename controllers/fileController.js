const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const AdmZip = require('adm-zip');
const { pipeline } = require('stream');
const util = require('util');
const streamPipeline = util.promisify(pipeline);
const HttpStatus = require("../models/HttpStatus");
const Response = require("../models/Response");
const fileService = require("../services/fileService");
const validationService = require("../services/validationService");

const get = async (req, res) => {
    try {
        const {error} = validationService.validateGettingFile(req.query);
        if (error) {
            return res.status(HttpStatus.BAD_REQUEST).json(new Response(false, error.message));
        }

        const filePath = path.join(__dirname, "..", "uploads", ...req.query.path.split('/'));
        if (!fs.existsSync(filePath)) {
            return res.status(HttpStatus.NOT_FOUND).json(new Response(false, "File not found"));
        }

        const fileName = req.query.path.split('/')[req.query.path.split('/').length - 1];

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'inline; filename="content.zip"');

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        if (fs.statSync(filePath).isDirectory()) {
            archive.pipe(res);
            await fileService.addFilesToArchive(filePath, '', archive);
            await archive.finalize();
        }
        else {
            archive.on('error', (err) => {
                console.error('Archiver error:', err);
                res.status(500).send('Error creating zip file');
            });

            archive.pipe(res);
        
            archive.file(filePath, { name: fileName });
        
            await archive.finalize();
        }
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, error.message));
    }
}

const upload = async (req, res) => {
    try {
        const folderPath = path.join(__dirname, '..', 'uploads', 'file');
        const folderZip = path.join(__dirname, '..', 'uploads', 'temp_file');

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (path.extname(req.file.originalname) === '.zip') {
            const zipFilePath = path.join(folderZip, req.file.originalname);

            const bufferStream = new (require('stream').Duplex)();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null);

            await streamPipeline(
                bufferStream,
                fs.createWriteStream(zipFilePath)
            );

            const unzipFolderPath = path.join(folderPath, path.basename(req.file.originalname, '.zip'));

            const zip = new AdmZip(zipFilePath);
            zip.extractAllTo(unzipFolderPath, true);

            const isValidFile = await fileService.checkValidFile(unzipFolderPath);
            if (!isValidFile) {
                fs.rmSync(unzipFolderPath, { recursive: true, force: true });
                return res.status(400).send('File invalid.');
            }

            fs.unlinkSync(zipFilePath);

            return res.status(HttpStatus.CREATED).json(new Response(true, "Upload successfully"));
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json(new Response(true, "Only zip files are allowed"));
        }
    } catch (error) {
        console.error('Error extracting zip file:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, "Internal server error"));
    }
};

const remove = async (req, res) => {
    try {
        const filePath = path.join(__dirname, "..", "uploads", req.query.path);

        if (!fs.existsSync(filePath)) {
            return res.status(HttpStatus.NOT_FOUND).json(new Response(false, "File not found"));
        }

        if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });        
        }
        else {
            fs.unlinkSync(filePath);
        }

        return res.status(HttpStatus.OK).json(new Response(true, "Delete successfully"));   
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, "Internal server error"));
    }
};

module.exports = {
    get,
    upload,
    remove,
}