import mongoose, { Schema } from "mongoose";
import { IRegistration } from "../types";

const registrationSchema: Schema = new Schema(
  {
    batch: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isOpening: {
      type: Boolean,
      required: true,
    },
    semester: {
      type: String,
      ref: "Semester",
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

export default mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);
