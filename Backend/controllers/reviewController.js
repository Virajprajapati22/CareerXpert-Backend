import AppError from "../middlewares/errorHandler.js";
import { catchAsync } from "../middlewares/catchAsync.js";
import { Review } from "../models/reviewModel.js";
import { Company } from "../models/companyModel.js";

export const addReview = catchAsync(async (req, res, next) => {
    const existingReview = await Review.findOne({
        company: req.params.companyId,
        user: req.user._id,
    });

    if (existingReview) {
        return next(new AppError('You have already reviewed this company', 400));
    }

    const review = new Review({
        company: req.params.companyId,
        user: req.user._id,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
    });

    await review.save();

    const company = await Company.findById(req.params.id);
    company.reviews.push(review._id);
    await company.save();

    res.status(201).json({
        status: 'success',
        message: 'Review added successfully',
        review,
    });
});

export const getReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ company: req.params.companyId })
        .populate('user', 'username')
        .populate('company', 'name');

    res.status(200).json({
        status: 'success',
        reviews
    });
});

export const deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to delete this review', 403));
    }

    await review.remove();

    const company = await Company.findById(review.company);
    company.reviews.pull(review._id);
    await company.save();

    res.status(204).json({
        status: 'success',
        message: 'Review deleted successfully'
    });
});

export const updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }

    if (review.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to update this review', 403));
    }

    review.rating = req.body.rating;
    review.reviewText = req.body.reviewText;

    await review.save();

    res.status(200).json({
        status: 'success',
        message: 'Review updated successfully',
        review
    });
})