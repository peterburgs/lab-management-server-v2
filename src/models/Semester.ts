import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ISemester } from "../types";
import AcademicYear from "./AcademicYear";

// Schema
const semesterSchema: Schema = new Schema(
  {
    academicYear: {
      type: String,
      ref: AcademicYear,
      required: true,
    },
    semesterName: {
      type: String,
      required: true,
      default: "New Semester",
    },
    index: {
      type: Number,
      required: true,
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
    labSchedule: {
      type: Array,
      required: false,
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
