import { Router } from "express";
import requireAuth from "../helpers/requireAuth";
import User from "../models/User";
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
    if (!user) {
      return res.status(404).json({
        message: "Email " + req.body.user.email + " not found",
        verifiedUser: null,
        avatarUrl: null,
        verifiedRole: null,
        verifiedToken: null,
      });
    }
    if (user.roles.includes(Number(req.query.role))) {
      if (!user.avatarUrl) {
        user.avatarUrl = req.body.user.picture;
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
    log(STATUSES.INFO, error.message);
    res.status(500).json({
      message: message(STATUSES.ERROR, error.message),
      verifiedUser: null,
      avatarUrl: null,
      verifiedRole: null,
      verifiedToken: null,
    });
  }
});

export default router;
