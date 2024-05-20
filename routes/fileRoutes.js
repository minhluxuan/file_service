const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const unzipper = require("unzipper");
const archiver = require("archiver");

const router = express.Router();

// Configure Multer to store uploaded files in 'uploads' folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Serve the HTML file for the form
router.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', 'quynh_nguyen.jpg');
    const zipFileName = 'quynh_nguyen.jpg';

    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    
    const archive = archiver('zip', {
        zlib: { level: 9 } // Thiết lập mức độ nén
    });

    archive.on('error', (err) => {
        console.error('Archiver error:', err);
        res.status(500).send('Error creating zip file');
    });

    // Pipe output của archiver vào response
    archive.pipe(res);

    // Thêm tệp vào archive
    archive.file(filePath, { name: 'Hop_dong_giai_doan_2.docx' });

    // Kết thúc việc tạo zip
    archive.finalize();
});

router.get('/download', (req, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', 'quynh_nguyen.jpg');
    res.sendFile(filePath, err => {
        if (err) {
            res.status(500).send('Error sending file');
        }
    });
});

// Handle the file upload
// app.post('/upload', upload.array('files'), (req, res) => {
//     const uploadedFiles = req.files.map(file => {
//         const filePath = path.join(__dirname, 'uploads', file.originalname);
//         const stats = fs.statSync(filePath);

//         return {
//             name: file.originalname,
//             type: stats.isDirectory() ? 'directory' : 'file'
//         };
//     });

//     res.json({ uploadedFiles });
// });

// Handle the file upload
router.post('/upload', upload.single('file'), (req, res) => {
    const uploadedFile = req.file;
    const folderPath = 'uploads';

    // Kiểm tra xem file có phải là file nén không (ví dụ: .zip)
    if (path.extname(uploadedFile.originalname) === '.zip') {
        // Đường dẫn đến tệp zip tải lên
        const zipFilePath = path.join(folderPath, uploadedFile.originalname);

        // Đường dẫn đến thư mục giải nén
        const unzipFolderPath = path.join(folderPath, path.basename(uploadedFile.originalname, path.extname(uploadedFile.originalname)));

        // Giải nén tệp zip
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(unzipFolderPath, true);

        // Lấy cây thư mục của thư mục vừa giải nén
        const directoryTree = getDirectoryTree(unzipFolderPath);

        // Gửi cây thư mục dưới dạng HTML
        res.send(`<pre>${directoryTree}</pre>`);
    } else {
        res.status(400).send('Only ZIP files are allowed.');
    }
});

// Function to get directory tree structure
const getDirectoryTree = (dir, prefix = '') => {
    let tree = '';
    const items = fs.readdirSync(dir);

    items.forEach((item, index) => {
        const itemPath = path.join(dir, item);
        const isLast = index === items.length - 1;
        const newPrefix = prefix + (isLast ? '└── ' : '├── ');

        tree += `${prefix}${newPrefix}${item}\n`;

        if (fs.statSync(itemPath).isDirectory()) {
            tree += getDirectoryTree(itemPath, prefix + (isLast ? '    ' : '│   '));
        }
    });

    return tree;
};

module.exports = router;