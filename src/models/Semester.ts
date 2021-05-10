import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ISemester } from "../types";

// Schema
const semesterSchema: Schema = new Schema(
  {
    semesterName: {
      type: String,
      required: true,
      default: "New Semester",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    numberOfWeeks: {
      type: Number,
      required: true,
      min: 0,
    },
    isOpening: {
      type: Boolean,
      required: true,
      default: true,
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
export default mongoose.model<ISemester>("Semester", semesterSchema);
