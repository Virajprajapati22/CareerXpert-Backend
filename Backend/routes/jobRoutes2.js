import express from 'express';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js';
import { getAllJobs, getJobById } from '../controllers/jobController.js';


const jobRouter2 = express.Router();

jobRouter2.get('/', getAllJobs)
jobRouter2.get('/:id', getJobById)

export default jobRouter2;