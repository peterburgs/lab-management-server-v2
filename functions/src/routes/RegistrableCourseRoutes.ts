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
  ILab,
  IRegistrableCourse,
} from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Semester from "../models/Semester";
import Course from "../models/Course";
import Registration from "../models/Registration";
import Lab from "../models/Lab";
import RegistrableCourse from "../models/RegistrableCourse";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all Registrable Courses
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const registrableCourses = await RegistrableCourse.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (registrableCourses.length) {
          log(STATUSES.SUCCESS, "Get all Registrable Courses successfully");
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all Registrable Courses successfully"
            ),
            count: registrableCourses.length,
            registrableCourses,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get Registrable Courses");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get Registrable Courses"),
            count: 0,
            registrableCourses: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          registrableCourses: [],
        });
      }
    }
  );
});

// POST method: create list of registrable courses
router.post("/bulk", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let registrableCourses = req.body.registrableCourses;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (let index = 0; index < registrableCourses.length; index++) {
          // Validate registration
          let registration = await Registration.findOne(
            {
              _id: registrableCourses[index].registration,
              isHidden: false,
            },
            null,
            { session }
          );
          if (!registration) {
            session.abortTransaction();
          }

          // Validate course
          let course = await Course.findOne(
            {
              _id: registrableCourses[index].course,
              isHidden: false,
            },
            null,
            { session }
          );
          if (!course) {
            session.abortTransaction();
          }
          // Only if registration and course are valid then
          let registrableCourse: IRegistrableCourse = new RegistrableCourse({
            registration: registrableCourses[index].registration,
            course: registrableCourses[index].course,
          });
          try {
            registrableCourse = await registrableCourse.save({ session });
            if (registrableCourse) {
              log(
                STATUSES.CREATED,
                `Create new Registrable Course ${[index]} successfully`
              );
            } else {
              log(STATUSES.ERROR, `Cannot create Registrable Courses`);
              res.status(500).json({
                message: message(
                  STATUSES.ERROR,
                  `Cannot create Registrable Courses`
                ),
                registrableCourse: null,
              });
              session.abortTransaction();
            }
          } catch (error) {
            log(STATUSES.ERROR, error.message);
            res.status(500).json({
              message: message(STATUSES.ERROR, error.message),
              registrableCourse: null,
            });
            session.abortTransaction();
          }
        }
        await session.commitTransaction();
      });
    } catch (error) {
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        registrableCourses: [],
      });
    } finally {
      await session.endSession();
    }
    res.status(201).json({
      message: message(
        STATUSES.CREATED,
        "Create Registrable courses successfully"
      ),
    });
    log(STATUSES.SUCCESS, "Create Registrable courses successfully");
    log(STATUSES.INFO, registrableCourses);
  });
});

// Export
export default router;
