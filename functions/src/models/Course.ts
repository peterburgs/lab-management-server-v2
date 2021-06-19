import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ICourse, COURSE_TYPES } from "../types";

// Schema
const courseSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    numberOfCredits: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: COURSE_TYPES,
      required: true,
    },
    isHidden: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

// Export
export default mongoose.model<ICourse>("Course", courseSchema);
