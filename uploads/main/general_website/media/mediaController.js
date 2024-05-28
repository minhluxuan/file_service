const mediaService = require("../services/mediaService");
const validationService = require("../services/validationService");
const HttpStatus = require("../models/HttpStatus");
const Response = require("../models/Response");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

const upload = async (req, res) => {
    try {
        const formattedDate = moment().format("YYYY-MM-DD");

        const { error } = validationService.validateUploadingContent(req.body);
        if (error) {
            return res.status(HttpStatus.BAD_REQUEST).json(new Response(false, error.message));
        }

        if (!req.file) {
            return res.status(HttpStatus.NOT_FOUND).json(new Response(false, "File không được để trống"));
        }

        const uploadDir = path.join(__dirname, '..', 'uploads', 'temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, req.file.filename);
        
        if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, "Đã xảy ra lỗi. Vui lòng thử lại."));
        }

        const fileStream = fs.createReadStream(filePath);
        const form = new FormData();
        form.append("file", fileStream, req.file.originalname);

        form.append('title', req.body.title || req.query.title);
        form.append('author', req.body.author || req.query.author);

        let response;
        try {
            response = await axios.post(
                "http://localhost:3001/v1/files/upload?path=general_website/media&option=default",
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                    },
                    validateStatus: function (status) {
                        return status >= 200 && status <= 500;
                    }
                }
            );
        } catch (error) {
            return res.status(HttpStatus.CONFLICT).json(new Response(false, error));
        }

        if (response.status < 200 || response.status > 299) {
            fs.unlinkSync(filePath);
            return res.status(response.status).json(new Response(false, response.data.message));
        }

        const data = new Object({
            id: uuidv4(),
            author: req.body.author,
            title: req.body.title,
            date_created: formattedDate,
            date_modified: formattedDate,
            file: req.file.originalname,
        });

        const resultSavingPost = await mediaService.savePost(data);
        if (!resultSavingPost || resultSavingPost.affectedRows === 0) {
            throw new Error("Error saving post");
        }

        fs.unlinkSync(filePath);

        return res.status(HttpStatus.CREATED).json(new Response(true, "Đăng bài viết thành công", data));
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, "Đã xảy ra lỗi. Vui lòng thử lại."));
    }
};

const getPosts = async (req, res) => {
    try {
        const { error } = validationService.validateGettingPost(req.body);
        if (error) {
            return res.status(HttpStatus.BAD_REQUEST).json(new Response(false, "Thông tin không hợp lệ"));
        }
   
        const resultGettingPosts = await mediaService.getPosts(req.body); 
        return res.status(HttpStatus.OK).json(new Response(true, "Lấy dữ liệu thành công", resultGettingPosts));
    } catch (error) {
        console.log(error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, "Đã xảy ra lỗi. Vui lòng thử lại."));
    }
}

const getFile = async (req, res) => {
    try {
        const { error } = validationService.validateGettingFile(req.query);
        if (error) {
            return res.status(HttpStatus.BAD_REQUEST).json(new Response(false, "Thông tin không hợp lệ"));
        }

        const resultGettingPost = await mediaService.getPostById(req.query.id);
        if (!resultGettingPost || resultGettingPost.length === 0 || !resultGettingPost[0].file) {
            return res.status(HttpStatus.NOT_FOUND).json(new Response(false, "Bài viết không tồn tại"));
        }

        let response;
        try {
            response = await axios.get(`http://localhost:3001/v1/files?path=general_website/media/${resultGettingPost[0].file}&option=default`, {
                responseType: 'stream'
            });
        } catch (error) {
            console.log(error);
            if (error.response.status == 404) {
                return res.status(HttpStatus.NOT_FOUND).json(new Response(false, "File không tồn tại"));
            }
            else {
                return res.status(error.response.status).json(new Response(false, "Đã xảy ra lỗi. Vui lòng thử lại"));
            }
        }

        res.setHeader('Content-Disposition', `attachment; filename="${resultGettingPost[0].file}"`);
        res.setHeader('Content-Type', response.headers['content-type']);

        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while fetching the file" });
    }
};

module.exports = {
    upload,
    getFile,
    getPosts,
}