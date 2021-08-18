import mongoose, { Schema } from "mongoose";
import { IComment } from "../types";

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

export default mongoose.model<IComment>("Comment", commentSchema);
