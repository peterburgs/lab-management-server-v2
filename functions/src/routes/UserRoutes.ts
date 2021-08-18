import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IUser } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import User from "../models/User";

const router = Router();
router.use(requireAuth);

// GET method: get all users
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const users = await User.find({ isHidden: false, ...req.query }).exec();
        if (users.length) {
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all users successfully"),
            count: users.length,
            users,
          });
        } else {
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get users"),
            count: 0,
            users: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          users: [],
        });
      }
    }
  );
});

// POST method: create new user
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let user: IUser = new User({
      _id: req.body._id,
      email: req.body.email,
      fullName: req.body.fullName,
      roles: req.body.roles,
      avatarUrl: req.body.avatarUrl,
      isFaceIdVerified: req.body.isFaceIdVerified,
      isHidden: req.body.isHidden,
    });
    try {
      user = await user.save();
      if (user) {
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new user successfully"),
          user,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        user: null,
      });
    }
  });
});

// PUT method: update a user
router.put("/:id", async (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const user = await User.findByIdAndUpdate(
          {
            _id: req.params.id,
            isHidden: false,
          },
          {
            $set: req.body,
          },
          { new: true, upsert: true }
        ).exec();
        if (user) {
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Update user successfully"),
            user,
          });
        } else {
          res.status(422).json({
            message: message(STATUSES.ERROR, "Cannot update user"),
            user: null,
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          user: null,
        });
      }
    }
  );
});

// DELETE method: delete a user
router.delete("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const deletedUser = await User.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: { isHidden: true },
        },
        { new: true }
      ).exec();
      if (deletedUser) {
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete user successfully"),
          user: deletedUser,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot delete user"),
          user: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, "Cannot delete user");
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        user: null,
      });
    }
  });
});

export default router;
