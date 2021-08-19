import mongoose, { Schema } from "mongoose";
import { IAcademicYear } from "../types";

const academicYearSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

export default mongoose.model<IAcademicYear>(
  "AcademicYear",
  academicYearSchema
);
