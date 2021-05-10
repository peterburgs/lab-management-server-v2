import express, { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log from "../util/log";
import { STATUSES } from "../common/statuses";

// Import models
import User from "../models/User";
import { ROLES } from "../types";

// Config router
const router = Router();

// GET method: get all user
router.get("/", async (req, res) => {
  try {
    // TODO: implement requireAuth Middleware
    const users = await User.find({ isHidden: false, ...req.params }).exec();
    if (users) {
      log(STATUSES.SUCCESS, "All users have been found");
      res.status(200).json({
        message: "All users have been found",
        count: users.length,
        users,
      });
    } else {
      log(STATUSES.SUCCESS, "No user found");
      res.status(404).json({
        message: "No user found",
        count: 0,
        users: [],
      });
    }
  } catch (error) {
    log(STATUSES.ERROR, error.message);
    res.status(500).json({
      message: error.message,
      count: 0,
      users: [],
    });
  }
});

// Export
export default router;
