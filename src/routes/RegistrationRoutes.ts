import express, { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IUser, ISemester, ICourse, IRegistration } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Semester from "../models/Semester";
import Course from "../models/Course";
import Registration from "../models/Registration";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all registrations
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const registrations = await Registration.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (registrations) {
          log(STATUSES.SUCCESS, "Get all registrations successfully");
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all registrations successfully"
            ),
            count: registrations.length,
            registrations,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get registrations");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get registrations"),
            count: 0,
            registrations: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          registrations: [],
        });
      }
    }
  );
});

// POST method: create new registration
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let registration: IRegistration = new Registration({
      batch: req.body.batch,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      isOpening: req.body.isOpening,
      semester: req.body.semester,
      isHidden: req.body.isHidden,
    });
    try {
      registration = await registration.save();
      if (registration) {
        log(STATUSES.CREATED, "Create new registration successfully");
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new registration successfully"
          ),
          registration,
        });
      } else {
        log(STATUSES.ERROR, "Cannot create new registration");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new registration"),
          registration: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        registration: null,
      });
    }
  });
});

// PUT method: update a registration
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let registration = await Registration.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (registration) {
        log(STATUSES.SUCCESS, "Update registration successfully");
        res.status(200).json({
          message: message(
            STATUSES.SUCCESS,
            "Update registration successfully"
          ),
          registration,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update registration");
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update registration"),
          registration: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        registration: null,
      });
    }
  });
});

// DELETE method: delete a course
router.delete("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const deletedCourse = await Course.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: { isHidden: true },
        },
        { new: true }
      ).exec();
      if (deletedCourse) {
        log(STATUSES.SUCCESS, "Delete course successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete course successfully"),
          course: deletedCourse,
        });
      } else {
        log(STATUSES.ERROR, "Cannot delete course");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot delete course"),
          course: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, "Cannot delete course");
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        course: null,
      });
    }
  });
});

// Export
export default router;
