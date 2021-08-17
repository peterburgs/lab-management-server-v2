import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { IRegistrableCourse, DAY_OF_WEEKS, PERIOD } from "../types";

// Schema
const registrableCourseSchema: Schema = new Schema(
  {
    registration: {
      type: String,
      ref: "Registration",
      required: true,
    },
    course: {
      type: String,
      ref: "Course",
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
export default mongoose.model<IRegistrableCourse>(
  "RegistrableCourse",
  registrableCourseSchema
);
