import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ICourse, IComment, IAcademicYear } from "../types";

// Schema
const academicYearSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    numberOfWeeks: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    isOpening: {
      type: Boolean,
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
export default mongoose.model<IAcademicYear>(
  "AcademicYear",
  academicYearSchema
);
