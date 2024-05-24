const multer = require("multer");

class Storage {
    #_upload;
    #_fieldName;
    #_maxFileSize;
    #_maxFileNameLength;
    #_filter;
    #_storage;

    constructor(fieldName, maxFileSize, maxFileNameLength) {
        if (new.target === Storage) {
            throw new Error("Cannot instantiate an abstract class directly");
        }

        this.#_fieldName = fieldName;
        this.#_maxFileSize = maxFileSize;
        this.#_maxFileNameLength = maxFileNameLength;
        this.#_filter = (req, file, done) => {
            if (!file) {
                return done(new Error("File không tồn tại."));
            }
        
            // if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") { 
            //    return done(new Error("Hình ảnh không hợp lệ. Chỉ các file .jpg, .jpeg, .png được cho phép."));
            // }
            // Check file type here

            if (file.size > this.#_maxFileSize) {
                done(new Error(`File có kích thước quá lớn. Tối đa ${this.#_maxFileSize}MB được cho phép.`));
            }
        
            if (file.originalname.length > this.#_maxFileNameLength) {
                done(new Error(`Tên file quá dài. Tối đa ${this.#_maxFileNameLength} ký tự được cho phép.`));
            }
        
            return done(null, true);
        };
    }

    _initializeUpload() {
        this.#_upload = multer({
            storage: this.#_storage,
            fileFilter: this.#_filter,
        });
    }

    get fieldName() {
        return this.#_fieldName;
    }

    get maxFileSize() {
        return this.#_maxFileSize;
    }

    set maxFileSize(newMaxFileSize) {
        this.#_maxFileSize = newMaxFileSize;
    }

    get maxFileNameLength() {
        return this.#_maxFileNameLength;
    }

    set maxFileNameLength(newMaxFileNameLength) {
        this.#_maxFileNameLength = newMaxFileNameLength;
    }

    get filter() {
        return this.#_filter;
    }

    set filter(newFilter) {
        this.#_filter = newFilter;
    }

    get storage() {
        return this.#_storage;
    }

    set storage(newStorage) {
        this.#_storage = newStorage;
        this._initializeUpload();
    }

    get upload() {
        return this.#_upload;
    }
};

module.exports = Storage;