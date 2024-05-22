class Response {
    success;
    data;
    message;

    constructor(success, message, data) {
        this.success = success;
        this.data = data;
        this.message = message;    
    }
}

module.exports = Response;