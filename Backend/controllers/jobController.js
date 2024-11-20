import { catchAsync } from "../middlewares/catchAsync.js";
import AppError from "../middlewares/errorHandler.js";
import { Job } from "../models/jobModel.js";
import { Company } from "../models/companyModel.js";

// Create a new job
export const createJob = catchAsync(async (req, res, next) => {
    const { title, description, requirements, location, experience, salary, perks, timing, category, domain, workType, userType, deadline } = req.body;

    if (new Date(deadline) < new Date()) {
        return next(new AppError('Deadline cannot be in the past', 400));
    }

    if(!title || !description || !location || !experience || !salary || !timing || !category || !domain || !workType || !userType || !deadline){
        return next(new AppError('Empty required field', 400));
    }

    console.log(req.params.companyId);
    // Check if the company exists and if the user is the owner
    const company = await Company.findById(req.params.companyId);
    if (!company) {
        return next(new AppError('Company not found', 404));
    }

    if (company.registeredBy.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to create a job for this company', 403));
    }

    const job = new Job({
        title,
        description,
        requirements,
        location,
        experience,
        salary,
        timing,
        perks,
        category,
        domain,
        workType,
        userType,
        deadline,
        company: req.params.companyId,
        created_by: req.user._id,
    });

    await job.save();

    res.status(201).json({
        status: 'success',
        message: 'Job created successfully',
        job,
    });
});

// Get all jobs
export const getAllJobs = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };

    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Job.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-postedDate');
    }

    // Field limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
        const numJobs = await Job.countDocuments();
        if (skip >= numJobs) throw new Error('This page does not exist');
    }

    const jobs = await query;

    res.status(200).json({
        status: 'success',
        results: jobs.length,
        jobs,
    });
});

// Get job by ID
export const getJobById = catchAsync(async (req, res, next) => {
    const job = await Job.findById(req.params.id).populate('company', 'name');

    if (!job) {
        return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
        status: 'success',
        job,
    });
});

// Get all jobs by a company
export const getCompanyJobs = catchAsync(async (req, res, next) => {
    const jobs = await Job.find({ company: req.params.companyId }).populate('company', 'name');

    res.status(200).json({
        status: 'success',
        results: jobs.length,
        jobs,
    });
});


// Update job
export const updateJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOneAndUpdate(
        { _id: req.params.id, created_by: req.user._id },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!job) {
        return next(new AppError('Job not found or you do not have permission to update this job', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Job updated successfully',
        job,
    });
});

// Delete job
export const deleteJob = catchAsync(async (req, res, next) => {
    const job = await Job.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });

    if (!job) {
        return next(new AppError('Job not found or you do not have permission to delete this job', 404));
    }

    res.status(204).json({
        status: 'success',
        message: 'Job deleted successfully',
    });
});
