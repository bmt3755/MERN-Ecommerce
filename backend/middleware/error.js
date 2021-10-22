const ErrorHandler = require("../utils/errorhandler");
const err = ErrorHandler.err
module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    
        res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });

    //Mongodb ID cast error
    if(err.name = "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400)
    }
};