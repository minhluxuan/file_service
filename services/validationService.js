const Joi = require("joi");

const validateGettingFile = (data) => {
    return Joi.object({
        path: Joi.string().required(),
        option: Joi.string().valid("default", "zip").required(),
        chunkSize: Joi.number().min(0),
    }).strict().validate(data);
}

const validateUploadingFile = (data) => {
    return Joi.object({
        path: Joi.string().required(),
        option: Joi.string().valid("zip", "unzip", "default").required(),
    }).strict().validate(data);
}

module.exports = {
    validateGettingFile,
    validateUploadingFile,
}
