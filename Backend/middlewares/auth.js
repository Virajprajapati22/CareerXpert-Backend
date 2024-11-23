import { catchAsync } from "./catchAsync.js";
import AppError from "./errorHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  let token;

  // 1) Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token
  }

  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  // 4) Attach user to request object
  req.user = user;
  next();
});

// export const isAuthenticated = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check if it's there
//   const { token } = req.cookies;

//   console.log(req, "REQ");

//   if (!token) {
//     return next(new AppError("You are not logged in", 400));
//   }

//   // 2) Verification token
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);

//   // 3) Check if user still exists
//   req.user = await User.findById(decoded.id);
//   next();
// });

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
