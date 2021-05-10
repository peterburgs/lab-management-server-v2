import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { IRegistration, DAY_OF_WEEKS, PERIOD } from "../types";

// Schema
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

// Export
export default mongoose.model<IRegistration>(
  "Registration",
  registrationSchema
);
