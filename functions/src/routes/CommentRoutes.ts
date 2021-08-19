import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IComment } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import Comment from "../models/Comment";

const router = Router();
router.use(requireAuth);

// GET method: get all comments
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const comments = await Comment.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (comments.length) {
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all comments successfully"),
            count: comments.length,
            comments,
          });
        } else {
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get comments"),
            count: 0,
            comments: [],
          });
        }
      } catch (error) {
        log(STATUSES.INFO, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          comments: [],
        });
      }
    }
  );
});

// POST method: create new comment
router.post("/", async (req, res, next) => {
  requireRole(
    [ROLES.LECTURER, ROLES.ADMIN],
    req,
    res,
    next,
    async (req, res, next) => {
      let comment: IComment = new Comment({
        user: req.body.uId,
        request: req.body.request,
        text: req.body.text,
      });
      try {
        comment = await comment.save();
        if (comment) {
          res.status(201).json({
            message: message(
              STATUSES.CREATED,
              "Create new comment successfully"
            ),
            comment,
          });
        } else {
          res.status(500).json({
            message: message(STATUSES.ERROR, "Cannot create new comment"),
            comment: null,
          });
        }
      } catch (error) {
        log(STATUSES.INFO, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          comment: null,
        });
      }
    }
  );
});

// DELETE Method: delete a comment
router.post("/:id", async (req, res, next) => {
  requireRole(
    [ROLES.LECTURER, ROLES.ADMIN],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        let deletedComment = await Comment.findByIdAndUpdate(
          {
            _id: req.params.id,
            isHidden: false,
          },
          { $set: { isHidden: true } },
          { new: true }
        );
        if (deletedComment) {
          res.status(200).json({
            message: message(STATUSES.DELETED, "Delete comment successfully"),
            comment: deletedComment,
          });
        } else {
          res.status(500).json({
            message: message(STATUSES.ERROR, "Cannot delete comment"),
            comment: null,
          });
        }
      } catch (error) {
        log(STATUSES.INFO, error.message);

        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          comment: null,
        });
      }
    }
  );
});
// Export
export default router;
