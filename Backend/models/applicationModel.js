import mongoose, { Schema } from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: String,
    },

    status: {
      type: String,
      enum: ["applied", "rejected", "accepted"],
      default: "applied",
    },

    appliedDate: {
      type: Date,
      default: Date.now(),
    },

    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);
