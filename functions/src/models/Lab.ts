import mongoose, { Schema } from "mongoose";
import { ILab } from "../types";

const labSchema: Schema = new Schema(
  {
    labName: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: false,
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

export default mongoose.model<ILab>("Lab", labSchema);
