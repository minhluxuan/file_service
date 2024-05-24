const fs = require("fs");
const multer = require("multer");
const path = require("path");
const fileType =  import ("file-type");
const Storage = require("./Storage");

class DiskStorage extends Storage {
    #_tempFilePath;
    #_filePath;
    static acceptedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/gif',
        'application/zip', 
        'application/x-tar',
        'application/x-rar-compressed', 
        'application/gzip',
        'video/mp4',
        'audio/mpeg',
        'audio/wav', 
        'audio/ogg', 
        'audio/aac',
        'video/webm',
        'model/gltf-binary',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'application/json',
        'application/xml',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/html',
        'image/webp'
    ];

    constructor(fieldName, maxFileSize, maxFileNameLength, tempFilePath, filePath) {
        super(fieldName, maxFileSize, maxFileNameLength);
        
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
                if (file.fieldname !== self.fieldName) {
                    return done(new Error(`Yêu cầu tên trường phải là "${self.fieldName}".`));
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
        this.filter = async (req, file, done) => {
            if (!file) {
                return done(new Error("File không tồn tại."));
            }
        
            if (!(await checkFileType())) {
                done(new Error("Contains invalid file type"));
            }

            if (file.size > this.maxFileSize) {
                done(new Error(`File có kích thước quá lớn. Tối đa ${this.maxFileSize}MB được cho phép.`));
            }
        
            if (file.originalname.length > this.maxFileNameLength) {
                done(new Error(`Tên file quá dài. Tối đa ${this.maxFileNameLength} ký tự được cho phép.`));
            }
        
            return done(null, true);
        };
    }

    static async checkFileType(dir) {
        const items = fs.readdirSync(dir);
    
        for (const item of items) {
            const itemPath = path.join(dir, item);
        
            if (fs.statSync(itemPath).isDirectory()) {
                const isValid = await DiskStorage.checkFileType(itemPath);
                if (!isValid) {
                    return false;
                }
            } else {
                const buffer = fs.readFileSync(itemPath);
                const type = await (await fileType).fileTypeFromBuffer(buffer);
                if (!type || !DiskStorage.acceptedTypes.includes(type.mime)) {
                    return false;
                }
            }
        }
    
        return true;
    };

    get filePath() {
        return this.#_filePath;
    }

    set filePath(newFilePath) {
        this.#_filePath = newFilePath;
    }
}

module.exports = DiskStorage;
