import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { IRequest } from "../types";
import { REQUEST_STATUSES } from "../common/requestStatuses";
import { REQUEST_TYPES } from "../common/requestTypes";

// Schema
const requestSchema: Schema = new Schema(
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
      min: 0,
    },
    startPeriod: {
      type: Number,
      min: 0,
    },
    endPeriod: {
      type: Number,
      min: 0,
    },

    teaching: {
      type: String,
      ref: "Teaching",
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
    labUsage: {
      type: String,
      ref: "LabUsage",
    },
    oldLab: {
      type: String,
      required: false,
    },
    oldWeekNo: {
      type: Number,
      required: false,
    },
    oldStartPeriod: {
      type: Number,
      required: false,
    },
    oldEndPeriod: {
      type: Number,
      required: false,
    },
    oldDayOfWeek: {
      type: Number,
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

// Export
export default mongoose.model<IRequest>("Request", requestSchema);
