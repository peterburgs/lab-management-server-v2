import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ITeaching, DAY_OF_WEEKS, PERIOD } from "../types";

// Schema
const teachingSchema: Schema = new Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    course: {
      type: String,
      ref: "Course",
      required: true,
    },
    group: {
      type: Number,
      required: true,
      min: 1,
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
    numberOfStudents: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfPracticalWeeks: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    registration: {
      type: String,
      ref: "Registration",
      required: true,
    },
    semester: {
      type: String,
      ref: "Semester",
      required: true,
    },
    theoryRoom: {
      type: String,
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
export default mongoose.model<ITeaching>("Teaching", teachingSchema);
