const Joi = require("joi");

const validateGettingFile = (data) => {
    return Joi.object({
        path: Joi.string().required(),
        chunkSize: Joi.number().min(0),
    }).strict().validate(data);
}

module.exports = {
    validateGettingFile,
}
