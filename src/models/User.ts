import mongoose, { model, Model, Schema, Document, Mongoose } from "mongoose";
import { IUser } from "../types";
// Schema
const userSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: false,
      default: "New User",
    },
    roles: {
      type: [Number],
      required: true,
    },
    avatarUrl: {
      type: String,
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

// Export model
export default mongoose.model<IUser>("User", userSchema);
