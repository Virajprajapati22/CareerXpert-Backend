import express from "express";
import {
  deleteCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompanies,
  registerCompany,
  updateCompany,
} from "../controllers/companyController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { addReview, getReviews } from "../controllers/reviewController.js";
// import jobRouter from './jobRoutes.js'

// Create a new router
const companyRouter = express.Router();

// Define routes
// companyRouter.post('/register', isAuthenticated, isAuthorized('Recruiter'), registerCompany)
companyRouter.post("/register", isAuthenticated, registerCompany);
// companyRouter.put('/update/:id', isAuthenticated, isAuthorized('Recruiter'), updateCompany)
companyRouter.put("/update/:id", isAuthenticated, updateCompany);
// companyRouter.delete('/delete/:id', isAuthenticated, isAuthorized('Recruiter'), deleteCompany)
companyRouter.delete("/delete/:id", isAuthenticated, deleteCompany);

// companyRouter.get('/my-companies', isAuthenticated, isAuthorized('Recruiter'), getMyCompanies)
companyRouter.get("/my-companies", isAuthenticated, getMyCompanies);
companyRouter.get("/", getAllCompanies);
companyRouter.get("/:id", getCompanyById);

companyRouter.post(
  "/:id/reviews",
  isAuthenticated,
  isAuthorized("Job Seeker"),
  addReview
);
companyRouter.get("/:id/reviews", isAuthenticated, getReviews);

// companyRouter.use('/:companyId/jobs', jobRouter)

export default companyRouter;
