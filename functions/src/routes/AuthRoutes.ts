import express, { Router, Request, Response, NextFunction } from "express";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import User from "../models/User";
import { ROLES } from "../types";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";

// Config
const router = Router();
router.use(requireAuth);

// GET method: get a user
router.get("/", async (req, res, next) => {
  try {
    let user = await User.findOne({
      email: req.body.user.email,
      isHidden: false,
    });
    // If user not found
    if (!user) {
      log(STATUSES.ERROR, "Cannot find user with email " + req.body.user.email);
      return res.status(404).json({
        message: "Email " + req.body.user.email + " not found",
        verifiedUser: null,
        avatarUrl: null,
        verifiedRole: null,
        verifiedToken: null,
      });
    }

    // If Found user
    if (user.roles.includes(Number(req.query.role))) {
      log(STATUSES.INFO, req.body.user);
      if (!user.avatarUrl) {
        user.avatarUrl = req.body.user.picture;
        console.log(user.avatarUrl);
      }
      user = await user.save();
      res.status(200).json({
        verifiedUser: {
          fullName: user.fullName,
          email: user.email,
          _id: user._id,
        },
        avatarUrl: req.body.user.picture,
        verifiedRole: req.query.role,
        verifiedToken: req.headers.authorization,
      });
    } else {
      res.status(500).json({
        message: message(STATUSES.ERROR, "Role of user is not allowed"),
        verifiedUser: null,
        avatarUrl: null,
        verifiedRole: null,
        verifiedToken: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: message(STATUSES.ERROR, error.message),
      verifiedUser: null,
      avatarUrl: null,
      verifiedRole: null,
      verifiedToken: null,
    });
  }
});

// Export
export default router;