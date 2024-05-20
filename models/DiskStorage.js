import Storage from "./Storage";
import "multer";

class DiskStorage extends Storage {
    #_tempPath;
    #_path;
    #_fileName;

    constructor(tempPath, path, fileName) {
        super();
        this.#_tempPath = tempPath;
        this.#_path = path;
        this.#_fileName = fileName;
        this.storage = multer.diskStorage({
            destination: function (req, file, done) {
                if (file.fieldname !== this._fieldName) {
                    return done(new Error(`Yêu cầu tên trường phải là "${this._fieldname}".`));
                }
        
                if (!fs.existsSync(this._tempPath)) {
                    fs.mkdirSync(this._tempPath, { recursive: true });
                }
        
                return done(null, this._tempPath);
            },
        
            filename: function (req, file, done) {
                done(null, file.originalname);
            }
        });
    }

    get path() {
        return this.#_path;
    }

    set path(newPath) {
        this.#_path = newPath;
    }

    get fileName() {
        return this.#_fileName;
    }

    set fileName(newFileName) {
        this.#_fileName = newFileName;
    }
}

module.exports = DiskStorage;