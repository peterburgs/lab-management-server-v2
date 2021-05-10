import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ICourse } from "../types";

// Schema
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
    },
    numberOfCredits: {
      type: Number,
      required: true,
      min: 0,
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
