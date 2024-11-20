class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
   
  export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal server error";
  
    if (err.name === "CastError") {
      const message = `Invalid ${err.path}: ${err.value}.`;
      err = new AppError(message, 400);
    }
  
    if (err.name === "JsonWebTokenError") {
      const message = `InValid JWT, Try again.`;
      err = new AppError(message, 400);
    }
  
    if (err.name === "TokenExpiredError") {
      const message = `Token Expired, Login again.`;
      err = new AppError(message, 400);
    }
  
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
    }
  
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
  
  export default AppError;
  