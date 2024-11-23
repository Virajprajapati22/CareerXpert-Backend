import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    profilePhoto: {
      id: {
        type: String, // Cloudinary's public_id
        required: false,
      },
      url: {
        type: String, // Cloudinary's secure_url
        required: false,
      },
    },

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please provide valid email"],
    },

    password: {
      type: String,
      required: true,
      minLength: [8, "Password must contain atleast 8 characters"],
    },

    role: {
      type: String,
      required: true,
      enum: ["Job Seeker", "Recruiter"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    phone: {
      type: String,
      // required: true,
    },

    city: {
      type: String,
      // required: true,
    },

    address: {
      type: String,
      // required: true,
    },

    dob: {
      type: Date,
      // required: true,
    },

    aboutMe: {
      type: String,
      // required: true,
    },

    skills: {
      type: [String],
      default: [],
      // required: true,
      // enum: ["C++", "SQL", "python", "Reactjs", "nodejs", "API Testing"],
    },

    resume: {
      id: {
        type: String, // Cloudinary's public_id
        required: false,
      },
      url: {
        type: String, // Cloudinary's secure_url
        required: false,
      },
    },

    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
    },

    jobPreference: {
      first: String,
      second: String,
      third: String,
    },

    coverLetter: {
      type: String,
    },

    resume: {
      id: String,
      url: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    passwordResetToken: String,

    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

export const User = mongoose.model("User", userSchema);
