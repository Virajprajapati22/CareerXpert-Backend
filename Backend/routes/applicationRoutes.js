import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  applyForJob,
  getApplicationById,
  getJobApplications,
  getUserApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

const applicationRouter = express.Router();

// Application routes
applicationRouter.post(
  "/:jobId/apply",
  isAuthenticated,
  isAuthorized("Job Seeker"),
  applyForJob
);
applicationRouter.get(
  "/:jobId/applications",
  isAuthenticated,
  isAuthorized("Recruiter"),
  getJobApplications
);
applicationRouter.get(
  "/myapplications",
  isAuthenticated,
  isAuthorized("Job Seeker"),
  getUserApplications
);
applicationRouter.patch(
  "/:applicationId",
  isAuthenticated,
  isAuthorized("Recruiter"),
  updateApplicationStatus
);
applicationRouter.get(
  "/:applicationId",
  isAuthenticated,
  isAuthorized("Recruiter"),
  getApplicationById
);

export default applicationRouter;
