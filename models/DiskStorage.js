const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Storage = require("./Storage");

class DiskStorage extends Storage {
    #_tempFilePath;
    #_filePath;

    constructor(fieldName, acceptedTypes, maxFileSize, maxFileNameLength, tempFilePath, filePath) {
        super(fieldName, acceptedTypes, maxFileSize, maxFileNameLength);
        
        this.#_tempFilePath = path.join(__dirname, ...tempFilePath.split('/'));
        this.#_filePath = path.join(__dirname, ...filePath.split('/'));

        if (!fs.existsSync(this.#_tempFilePath)) {
            fs.mkdirSync(this.#_tempFilePath);
        }

        if (!fs.existsSync(this.#_filePath)) {
            fs.mkdirSync(this.#_filePath);
        }

        const self = this;
        this.storage = multer.diskStorage({
            destination: function (req, file, done) {
                if (file.fieldname !== self._fieldName) {
                    return done(new Error(`Yêu cầu tên trường phải là "${self._fieldName}".`));
                }
        
                if (!fs.existsSync(self.#_tempFilePath)) {
                    fs.mkdirSync(self.#_tempFilePath, { recursive: true });
                }
        
                return done(null, self.#_tempFilePath);
            },
        
            filename: function (req, file, done) {
                done(null, file.originalname);
            }
        });
    }

    get filePath() {
        return this.#_filePath;
    }

    set filePath(newFilePath) {
        this.#_filePath = newFilePath;
    }
}

module.exports = DiskStorage;
