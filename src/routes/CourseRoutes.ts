import express, { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IUser, ISemester, ICourse } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Semester from "../models/Semester";
import Course from "../models/Course";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all courses
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const courses = await Course.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (courses) {
          log(STATUSES.SUCCESS, "Get all courses successfully");
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all courses successfully"),
            count: courses.length,
            courses,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get courses");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get courses"),
            count: 0,
            courses: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          courses: [],
        });
      }
    }
  );
});

// POST method: create new course
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let course: ICourse = new Course({
      courseName: req.body.courseName,
      numberOfCredits: req.body.numberOfCredits,
      isHidden: req.body.isHidden,
    });
    try {
      course = await course.save();
      if (course) {
        log(STATUSES.CREATED, "Create new course successfully");
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new course successfully"),
          course,
        });
      } else {
        log(STATUSES.ERROR, "Cannot create new course");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new course"),
          course: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        course: null,
      });
    }
  });
});

// PUT method: update a course
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let course = await Course.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (course) {
        log(STATUSES.SUCCESS, "Update course successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update course successfully"),
          course,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update course");
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update course"),
          course: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        semester: null,
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
