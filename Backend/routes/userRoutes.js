import express from "express";
import {
  register,
  login,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  getMe,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { deleteUserbyId } from "../controllers/userController.js";
import { getJobRecommendations } from "../controllers/userController.js";
import { isAuthorized } from "../middlewares/auth.js";

// Create a new router
const userRouter = express.Router();

// Define routes
userRouter.post("/register", register);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.get("/me", isAuthenticated, getMe);
userRouter.patch("/update-profile", isAuthenticated, updateProfile);
userRouter.delete("/delete/:id", isAuthenticated, deleteUserbyId);

userRouter.get(
  "/recommendations",
  isAuthenticated,
  isAuthorized("Job Seeker"),
  getJobRecommendations
);

export default userRouter;
