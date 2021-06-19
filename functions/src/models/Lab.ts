import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ILab, DAY_OF_WEEKS, PERIOD } from "../types";

// Schema
const labSchema: Schema = new Schema(
  {
    labName: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailableForCurrentUsing: {
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
export default mongoose.model<ILab>("Lab", labSchema);
