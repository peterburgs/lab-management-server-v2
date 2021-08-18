import mongoose, { Schema } from "mongoose";
import { IRegistrableCourse } from "../types";

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

export default mongoose.model<IRegistrableCourse>(
  "RegistrableCourse",
  registrableCourseSchema
);
