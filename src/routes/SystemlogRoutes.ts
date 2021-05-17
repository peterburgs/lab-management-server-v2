import express, { Router, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IUser, IRequest, ISystemlog } from "../types";
import { ACTIONS } from "../common/actions";
import { MODELS } from "../common/models";
import { REQUEST_STATUSES } from "../common/requestStatuses";
import { REQUEST_TYPES } from "../common/requestTypes";

// Middleware
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Request from "../models/Request";
import Systemlog from "../models/Systemlog";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all systemlogs
router.get("/", (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const systemlogs = await Request.find({
        isHidden: false,
        ...req.query,
      }).exec();
      if (systemlogs.length) {
        log(STATUSES.SUCCESS, "Get all systemlogs successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Get all systemlogs successfully"),
          count: systemlogs.length,
          systemlogs,
        });
      } else {
        log(STATUSES.ERROR, "Cannot get systemlogs");
        res.status(404).json({
          message: message(STATUSES.ERROR, "Cannot get systemlogs"),
          count: 0,
          systemlogs: [],
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        count: 0,
        systemlogs: [],
      });
    }
  });
});

// POST method: create new systemlog
router.post("/", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    let systemlog: ISystemlog = new Systemlog({
      lab: req.body.lab,
      status: req.body.status,
      user: req.body.user,
      weekNo: req.body.weekNo,
      dayOfWeek: req.body.dayOfWeek,
      startPeriod: req.body.startPeriod,
      endPeriod: req.body.endPeriod,
      labUsage: req.body.labUsage,
      teaching: req.body.teachings,
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
    });
    try {
      systemlog = await systemlog.save();
      if (systemlog) {
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new systemlog successfully"
          ),
          systemlog,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        systemlog: null,
      });
    }
  });
});

// Export
export default router;
