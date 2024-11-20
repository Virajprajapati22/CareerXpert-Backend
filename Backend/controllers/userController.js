import { catchAsync } from '../middlewares/catchAsync.js';
import AppError from '../middlewares/errorHandler.js';
import { User } from './../models/userModel.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import { sendEmail } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import crypto from 'crypto';
// import  {v2 as cloudinary } from 'cloudinary';
import cloudinary from '../utils/cloudinary.js';
import { Job } from './../models/jobModel.js';

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const signToken = (id) => {
    // create token
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}; 

const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    // cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true
    };
     
    res.cookie('token', token, cookieOptions); // send token via cookie for security
    res.status(statusCode).json({
        status: 'success',
        message,
        user,
        token,
    });
};

export const register = catchAsync(async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // check if required fields are empty
        if (!username || !email || !password || !role) {
            return next(new AppError('Empty required field.', 400));
        }

        // check if email is already registered
        const isExist = await User.findOne({ email });
        if (isExist) {
            return next(new AppError('Email is already registered.', 400));
        }
        
        // create verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        const user = new User({
            username,
            email,
            password,
            role
        })

        await user.save()
        
        // send verification email to user
        await sendVerificationEmail(email, verificationToken) 
        
        res.status(200).json({
            status: 'success', 
            message: 'Signup successful, check your email to verify your account.',
            user,
            verificationToken,
        });

    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
});


export const verifyEmail = catchAsync(async (req, res, next) => {
    try {
      const { token } = req.query;
  
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Find the user by email
      const user = await User.findOne({ email: decoded.email });

      if (!user || user.isVerified) {
        return next(new AppError('Invalid token or already verified account.', 400));
      }
  
      // Update user status to verified
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
  
      res.status(200).json({ status: 'success',  message: "Email verified successfully." });
    } catch (error) {
      res.status(400).json({ status: 'failure', message: error.message });
      
    }
  });



export const login = catchAsync(async (req, res, next) => {
    const { email, password, role } = req.body;

    // check if required fields are empty
    if (!role || !email || !password) {
        return next(new AppError('Empty required field.', 400));
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Invalid Email.', 400));
    }

    // comapre password with hashed password that is stored in database
    const passwordMatch = await bcrypt.compare(password, user.password); 

    if (!passwordMatch) {
        return next(new AppError('Wrong password.', 400));
    }

    if (role !== user.role) {
        return next(new AppError('invalid credentials', 400));
    }

    if(!user.isVerified) {
        return next(new AppError('Email is not verified yet, please do it first', 400))
    }

    // if everything is correct, send token to client
    createSendToken(user, 201, res, 'user logged in successfully'); 
});




export const logout = catchAsync(async (req, res, next) => {

    // clear cookie by expiring it at current time
    console.log("Logout request received:", req.headers);

    res.status(200)
        .cookie('token', '', {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            status: 'success',
            message: 'logged out successfully...',
        });

        // after that it will be removed from client side, now shoul be redirected to login page

});


export const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('User not found with that email.', 404));

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send token via email
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
    await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: `Forgot your password? Submit a new password and confirm password to: ${resetURL}`,
    });

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
    });
});


export const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res, 'Password reset successfull.');
});

export const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});


export const updateProfile = catchAsync(async (req, res, next) => {
    // Prevent password updates through this route
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updatePassword',
                400
            )
        );
    }

    // Clone and sanitize update data
    const updateData = { ...req.body };
    const sensitiveFields = [
        'password',
        'email',
        'role',
        'isVerified',
        'verificationToken',
        'passwordChangedAt',
        'passwordResetToken',
        'passwordResetExpires',
    ];
    sensitiveFields.forEach(field => delete updateData[field]);

    // Handle file uploads with Cloudinary
    try {
        if (req.files?.profilePhoto) {
            const profilePhoto = await cloudinary.uploader.upload(
                req.files.profilePhoto.tempFilePath,
                {
                    folder: 'profile-photos',
                    width: 150,
                    height: 150,
                    crop: 'fill',
                }
            );

            if (profilePhoto?.secure_url) {
                updateData.profilePhoto = {
                    id: profilePhoto.public_id,
                    url: profilePhoto.secure_url,
                };
            } else {
                throw new AppError('Error uploading profile photo', 400);
            }
        }

        if (req.files?.resume) {
            const resume = await cloudinary.uploader.upload(
                req.files.resume.tempFilePath,
                {
                    folder: 'resumes',
                }
            );

            if (resume?.secure_url) {
                updateData.resume = {
                    id: resume.public_id,
                    url: resume.secure_url,
                };
            } else {
                throw new AppError('Error uploading resume', 400);
            }
        }
    } catch (error) {
        return next(new AppError(error.message || 'File upload failed', 500));
    }

    // Update user document
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Respond with updated user data
    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        user,
    });
});


export const deleteUserbyId = async(req, res) => {
    
    console.log(req.params);

    try {
        // Destructure the 'id' parameter from the request
        const { id } = req.params;
       
        console.log(id);

        // Attempt to delete the user from the database using their ID
        await User.deleteOne({ _id: id });

        // Send a success response if the user is deleted
        return res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {

        // Send an error response if an exception occurs
        return res.status(404).json({ message: "Error" });
        
    }
};

export const getJobRecommendations = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const { skills, jobPreference, city } = user;

    // Build the query object with proper validation
    const query = {
        $or: [
            { requirements: { $in: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()) } },
            { category: { $in: [jobPreference.first, jobPreference.second, jobPreference.third].filter(Boolean) } },
            { location: city }
        ]
    };

    const jobs = await Job.find(query).limit(50); // Add a limit to avoid large responses

    if (!jobs.length) {
        return res.status(200).json({
            status: 'success',
            message: 'No jobs found matching your preferences',
            results: 0,
            jobs: [],
        });
    }

    res.status(200).json({
        status: 'success',
        results: jobs.length,
        jobs,
    });
});