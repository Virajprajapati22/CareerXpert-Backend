import { catchAsync } from "./catchAsync.js";
import AppError from "./errorHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/userModel.js";


export const isAuthenticated = catchAsync(async (req, res, next)=>{
    // 1) Getting token and check if it's there
    const { token } = req.cookies;
    if(!token){
        return next(new AppError('You are not logged in', 400))
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 3) Check if user still exists
    req.user = await User.findById(decoded.id);
    next();
})

 
export const isAuthorized = (...roles) => {
    return (req, res, next) => { 

        // check if logged in user is authorized to access the resource
        if (!roles.includes(req.user.role)) {
        return next(
          new AppError(
            `${req.user.role} not allowed to access this resource.`,
            400
          )
        );
      }
      next();
    };
  };