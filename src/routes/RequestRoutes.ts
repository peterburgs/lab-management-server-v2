import express, { Router, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IUser, IRequest } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Request from "../models/Request";
// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all requests
router.get("/", (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const requests = await Request.find({
        isHidden: false,
        ...req.query,
      }).exec();
      if (requests.length) {
        log(STATUSES.SUCCESS, "Get all requests successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Get all requests successfully"),
          count: requests.length,
          requests,
        });
      } else {
        log(STATUSES.ERROR, "Cannot get request");
        res.status(404).json({
          message: message(STATUSES.ERROR, "Cannot get request"),
          count: 0,
          requests: [],
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        count: 0,
        requests: [],
      });
    }
  });
});

// GET method: get requests belongs to a user
router.get("/:userId", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const user = await User.findById({
          _id: req.params.userId,
          isHidden: false,
        });
        const requests = await Request.find({
          isHidden: false,
          user: user!._id,
          ...req.query,
        }).exec();
        if (requests.length) {
          log(
            STATUSES.SUCCESS,
            `Get all requests belongs to ${user!._id} successfully`
          );
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              `Get all requests belongs to ${user!._id} successfully`
            ),
            count: requests.length,
            requests,
          });
        } else {
          log(STATUSES.ERROR, `Cannot get requests belongs to ${user!._id}`);
          res.status(404).json({
            message: message(
              STATUSES.ERROR,
              `Cannot get requests belongs to ${user!._id}`
            ),
            count: 0,
            requests: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          requests: [],
        });
      }
    }
  );
});

// POST method: create new request
router.post("/", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    let request: IRequest = new Request({
      lab: req.body.lab,
      status: req.body.status,
      user: req.body.uId,
      weekNo: req.body.weekNo,
      dayOfWeek: req.body.dayOfWeek,
      startPeriod: req.body.startPeriod,
      endPeriod: req.body.endPeriod,
      labUsage: req.body.labUsage,
      teaching: req.body.teaching,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
    });
    try {
      request = await request.save();
      if (request) {
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new request successfully"),
          request,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        request: null,
      });
    }
  });
});

// PUT method: update a request
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let status = req.body.status;
      let request = await Request.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        { $set: { status: status } },
        { new: true }
      );
      request = await request!.save();
      if (request) {
        res.status(200).json({
          message: message(STATUSES.UPDATED, "Update request successfully"),
          request,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.UPDATED, "Cannot update request"),
          request: null,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: message(STATUSES.UPDATED, error.message),
        request: null,
      });
    }
  });
});

// Export
export default router;
