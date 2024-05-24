const fs = require("fs");
const path = require("path");

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

const createDirectoriesFromMain = (dirPath) => {
    const directories = dirPath.split(path.sep);
    let currentPath = path.join(__dirname, "..", "uploads", "main");
    directories.forEach((directory) => {
        currentPath = path.join(currentPath, directory);

        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, { recursive: true });
        }
    });
}

module.exports = {
    addFilesToArchive,
    createDirectoriesFromMain,
}