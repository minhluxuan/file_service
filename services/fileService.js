const fs = require("fs");
const path = require("path");
const fileType =  import ("file-type"); 
const acceptedFileTypes = require("./acceptedFileTypes");

const addFilesToArchive = async (directoryPath, archivePath, archive) => {
    const files = await fs.promises.readdir(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const archiveFilePath = path.join(archivePath, file);

        const stat = await fs.promises.stat(filePath);

        if (stat.isDirectory()) {
            await addFilesToArchive(filePath, archiveFilePath, archive);
        } else {
            archive.file(filePath, { name: archiveFilePath });
        }
    }
}

const checkValidFile = async (dir) => {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
    
        if (fs.statSync(itemPath).isDirectory()) {
            const isValid = await checkValidFile(itemPath);
            if (!isValid) {
                return false;
            }
        } else {
            const buffer = fs.readFileSync(itemPath);
            const type = await (await fileType).fileTypeFromBuffer(buffer);
            if (!type || !acceptedFileTypes.includes(type.mime)) {
                return false;
            }
        }
    }

    return true;
};

module.exports = {
    addFilesToArchive,
    checkValidFile,
}