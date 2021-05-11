import express, { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import {
  ROLES,
  IUser,
  ISemester,
  ICourse,
  IRegistration,
  ITeaching,
} from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Semester from "../models/Semester";
import Course from "../models/Course";
import Registration from "../models/Registration";
import Teaching from "../models/Teaching";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all teaching
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const teachings = await Teaching.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (teachings) {
          log(STATUSES.SUCCESS, "Get all teachings successfully");
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all teachings successfully"
            ),
            count: teachings.length,
            teachings,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get teachings");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get teachings"),
            count: 0,
            teachings: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          teachings: [],
        });
      }
    }
  );
});

// POST method: create a new teaching
router.post("/", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    let teaching: ITeaching = new Teaching({
      course: req.body.course,
      group: req.body.group,
      numberOfStudents: req.body.numberOfStudents,
      theoryRom: req.body.theoryRom,
      numberOfPracticalWeeks: req.body.numberOfPracticalWeeks,
      dayOfWeek: req.body.dayOfWeek,
      startPeriod: req.body.startPeriod,
      endPeriod: req.body.endPeriod,
      isHidden: req.body.isHidden,
    });
    try {
      teaching = await teaching.save();
      if (teaching) {
        log(STATUSES.CREATED, "Create new teaching successfully");
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new teaching successfully"
          ),
          teaching,
        });
      } else {
        log(STATUSES.ERROR, "Cannot create new teaching");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new teaching"),
          teaching: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        teaching: null,
      });
    }
  });
});

// POST method: create many teachings
router.post("/bulk", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    let teachings = req.body.teachings;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (let index = 0; index < teachings.length; index++) {
          // Validate course
          let course = await Course.findOne(
            {
              _id: teachings[index].course,
              isHidden: false,
            },
            null,
            { session }
          );
          if (!course) {
            session.abortTransaction();
          }
          let teaching: ITeaching = new Teaching({
            course: teachings[index].course,
            group: teachings[index].group,
            numberOfStudents: teachings[index].numberOfStudents,
            theoryRom: teachings[index].theoryRom,
            numberOfPracticalWeeks: teachings[index].numberOfPracticalWeeks,
            dayOfWeek: teachings[index].dayOfWeek,
            startPeriod: teachings[index].startPeriod,
            endPeriod: teachings[index].endPeriod,
            isHidden: teachings[index].isHidden,
          });
          teaching = await teaching.save({ session });
          if (!teaching) {
            log(STATUSES.ERROR, "Cannot create teaching");
            res.status(500).json({
              message: message(STATUSES.ERROR, "Cannot create teaching"),
              teachings: [],
            });
            session.abortTransaction();
          }
        }
        await session.commitTransaction();
        log(STATUSES.SUCCESS, "Create new teaching successfully");
        res.status(201).json({
          message: message(
            STATUSES.SUCCESS,
            "Create new Teaching successfully"
          ),
          teachings,
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

// PUT method: update a teaching
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    try {
      let teaching = await Teaching.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (teaching) {
        log(STATUSES.SUCCESS, "Update teaching successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update teaching successfully"),
          teaching,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update teaching");
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update teaching"),
          teaching: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        teaching: null,
      });
    }
  });
});

// DELETE method: delete a teaching
router.delete("/:id", async (req, res, next) => {
  requireRole([ROLES.LECTURER], req, res, next, async (req, res, next) => {
    try {
      const deletedTeaching = await Teaching.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: { isHidden: true },
        },
        { new: true }
      ).exec();
      if (deletedTeaching) {
        log(STATUSES.SUCCESS, "Delete teaching successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete teaching successfully"),
          teaching: deletedTeaching,
        });
      } else {
        log(STATUSES.ERROR, "Cannot delete teaching");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot delete teaching"),
          teaching: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, "Cannot delete teaching");
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        teaching: null,
      });
    }
  });
});

// Export
export default router;
