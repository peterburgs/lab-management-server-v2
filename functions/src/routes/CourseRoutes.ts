import mongoose from "mongoose";
import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, ICourse } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import Course from "../models/Course";

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
        if (courses.length) {
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all courses successfully"),
            count: courses.length,
            courses,
          });
        } else {
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
      _id: req.body._id,
      courseName: req.body.courseName,
      numberOfCredits: req.body.numberOfCredits,
      type: req.body.type,
      isHidden: req.body.isHidden,
    });
    try {
      course = await course.save();
      if (course) {
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new course successfully"),
          course,
        });
      } else {
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
// POST method: create many courses
router.post("/bulk", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let courses = req.body.courses;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (let index = 0; index < courses.length; index++) {
          let course: ICourse = new Course({
            _id: courses[index]._id,
            courseName: courses[index].courseName,
            numberOfCredits: courses[index].numberOfCredits,
            type: courses[index].type,
            isHidden: courses[index].isHidden,
          });
          course = await course.save({ session });
          courses[index]._id = course._id;
          if (!course) {
            log(STATUSES.ERROR, "Cannot create course");
            res.status(500).json({
              message: message(STATUSES.ERROR, "Cannot create course"),
              courses: [],
            });
            session.abortTransaction();
          }
        }
        await session.commitTransaction();
        res.status(201).json({
          message: message(STATUSES.SUCCESS, "Create new course successfully"),
        });
      });
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
      });
    } finally {
      session.endSession();
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
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update course successfully"),
          course,
        });
      } else {
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
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete course successfully"),
          course: deletedCourse,
        });
      } else {
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

export default router;
