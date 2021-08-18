import mongoose, { Schema } from "mongoose";
import { ICourse, COURSE_TYPES } from "../types";

const courseSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
      unique: true,
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

export default mongoose.model<ICourse>("Course", courseSchema);
