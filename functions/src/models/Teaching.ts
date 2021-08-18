import mongoose, { Schema } from "mongoose";
import { ITeaching, DAY_OF_WEEKS, PERIOD } from "../types";

const teachingSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: false,
    },
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
      max: PERIOD.SIXTEENTH,
    },
    endPeriod: {
      type: Number,
      required: true,
      min: PERIOD.ONE,
      max: PERIOD.SIXTEENTH,
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
    theoryRoom: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    startPracticalWeek: {
      type: Number,
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

export default mongoose.model<ITeaching>("Teaching", teachingSchema);
