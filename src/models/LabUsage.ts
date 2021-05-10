import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ILabUsage, DAY_OF_WEEKS, PERIOD } from "../types";

// Schema
const labUsageSchema: Schema = new Schema(
  {
    semester: {
      type: String,
      ref: "Semester",
      required: true,
    },
    lab: {
      type: String,
      ref: "Lab",
      required: true,
    },
    teaching: {
      type: String,
      ref: "Teaching",
      required: true,
    },
    weekNo: {
      type: Number,
      required: true,
      min: 0,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: DAY_OF_WEEKS.MONDAY,
      max: DAY_OF_WEEKS.SUNDAY,
    },
    startPeriod: {
      type: Number,
      required: true,
      min: PERIOD.ONE,
      max: PERIOD.FIFTEEN,
    },
    endPeriod: {
      type: Number,
      required: true,
      min: PERIOD.ONE,
      max: PERIOD.FIFTEEN,
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
export default mongoose.model<ILabUsage>("LabUsage", labUsageSchema);
