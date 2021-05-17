import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { ICourse, IComment } from "../types";

// Schema
const commentSchema: Schema = new Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    request: {
      type: String,
      ref: "Request",
      required: true,
    },
    text: {
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
export default mongoose.model<IComment>("Comment", commentSchema);
