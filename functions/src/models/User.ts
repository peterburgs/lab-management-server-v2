import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";

const userSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
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
    isFaceIdVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    isHidden: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
