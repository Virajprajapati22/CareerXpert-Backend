import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from "../controllers/jobController.js";

const jobRouter1 = express.Router();

jobRouter1.post(
  "/:companyId",
  isAuthenticated,
  isAuthorized("Recruiter"),
  createJob
);
jobRouter1.get("/:companyId", getCompanyJobs);
jobRouter1.put("/:id", isAuthenticated, isAuthorized("Recruiter"), updateJob);
jobRouter1.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("Recruiter"),
  deleteJob
);

export default jobRouter1;
