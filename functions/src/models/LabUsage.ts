import mongoose, { Schema } from "mongoose";
import { ILabUsage, DAY_OF_WEEKS, PERIOD } from "../types";

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
      max: PERIOD.SIXTEENTH,
    },
    endPeriod: {
      type: Number,
      required: true,
      min: PERIOD.ONE,
      max: PERIOD.SIXTEENTH,
    },
    checkInAt: {
      type: Date,
      required: false,
    },
    checkOutAt: {
      type: Date,
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

export default mongoose.model<ILabUsage>("LabUsage", labUsageSchema);
