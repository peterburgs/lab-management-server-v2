import mongoose, { Model } from "mongoose";
import { Request, Response, NextFunction } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";

// Google API
import { auth, OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify token
const googleAuth = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [
      process.env.GOOGLE_CLIENT_ID!,
      process.env.EXPO_CLIENT_ID!,
      process.env.ANDROID_CLIENT_ID!,
      process.env.IOS_CLIENT_ID!,
    ],
  });
  return ticket.getPayload();
};
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    log(STATUSES.ERROR, "Authentication failed");
    return res.status(401).json({
      message: message(STATUSES.ERROR, "Authentication failed"),
      authorization,
    });
  }
  const token: string = authorization.split(" ")[1];
  try {
    const user = await googleAuth(token);
    req.body.user = user;
    req.headers.authorization = token;
    log(STATUSES.SUCCESS, "Authentication passed");
    next();
  } catch (error) {
    const errorMessage: string = error.message.split(",")[0];
    log(STATUSES.ERROR, errorMessage);
  }
};

export default requireAuth;
