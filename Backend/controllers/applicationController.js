import { catchAsync } from '../middlewares/catchAsync.js';
import AppError from '../middlewares/errorHandler.js';
import { Application } from '../models/applicationModel.js';
import { Job } from '../models/jobModel.js';
import { User } from '../models/userModel.js';

// Apply for a job
export const applyForJob = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;
    const { resume } = req.body;
    const applicantId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
        return next(new AppError('Job not found', 404));
    }

    const application = new Application({
        job: jobId,
        applicant: applicantId,
        resume,
    });

    await application.save();

    res.status(201).json({
        status: 'success',
        message: 'Application submitted successfully',
        application,
    });
});

// Get all applications for a job
export const getJobApplications = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId }).populate('applicant');

    res.status(200).json({
        status: 'success',
        results: applications.length,
        applications,
    });
});

// Get all applications by a user
export const getUserApplications = catchAsync(async (req, res, next) => {
    const applicantId = req.user._id;

    const applications = await Application.find({ applicant: applicantId }).populate('job');

    res.status(200).json({
        status: 'success',
        results: applications.length,
        applications,
    });
});

// Update application status
export const updateApplicationStatus = catchAsync(async (req, res, next) => {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
        return next(new AppError('Application not found', 404));
    } 

    application.status = status;
    application.feedback = feedback;
    await application.save();

    res.status(200).json({
        status: 'success',
        message: 'Application status updated successfully',
        application,
    });
});

// Get application by ID
export const getApplicationById = catchAsync(async (req, res, next) => {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId).populate('job applicant');
    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    res.status(200).json({
        status: 'success',
        application,
    });
});
