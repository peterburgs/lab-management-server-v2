import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { IRequest, ISystemlog } from "../types";
import { REQUEST_STATUSES } from "../common/requestStatuses";
import { REQUEST_TYPES } from "../common/requestTypes";

// Schema
const systemlogSchema: Schema = new Schema(
  {
    lab: {
      type: String,
      ref: "Lab",
      required: true,
    },
    status: {
      type: REQUEST_STATUSES,
      required: true,
    },
    user: {
      type: String,
      ref: "User",
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
      min: 0,
    },
    startPeriod: {
      type: Number,
      required: true,
      min: 0,
    },
    endPeriod: {
      type: Number,
      required: true,
      min: 0,
    },
    labUsage: {
      type: String,
      ref: "LabUsage",
      required: true,
    },
    teaching: {
      type: String,
      ref: "Teaching",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: REQUEST_TYPES,
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
export default mongoose.model<ISystemlog>("Systemlog", systemlogSchema);
