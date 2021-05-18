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
  IAcademicYear,
} from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import User from "../models/User";
import Semester from "../models/Semester";
import Course from "../models/Course";
import Registration from "../models/Registration";
import Teaching from "../models/Teaching";
import AcademicYear from "../models/AcademicYear";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all academic years
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const academicYears = await AcademicYear.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (academicYears.length) {
          log(STATUSES.SUCCESS, "Get all academic years successfully");
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all academic years successfully"
            ),
            count: academicYears.length,
            academicYears,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get academic years");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get academic years"),
            count: 0,
            academicYears: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          academicYears: [],
        });
      }
    }
  );
});

// POST method: create a new academic year
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let academicYear: IAcademicYear = new AcademicYear({
      name: req.body.name,
      numberOfWeeks: req.body.numberOfWeeks,
      startDate: new Date(req.body.startDate),
      isOpening: req.body.isOpening,
      isHidden: req.body.isHidden,
    });
    try {
      academicYear = await academicYear.save();
      if (academicYear) {
        log(STATUSES.CREATED, "Create new academic year successfully");
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new academic year successfully"
          ),
          academicYear,
        });
      } else {
        log(STATUSES.ERROR, "Cannot create new academic year");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new academic year"),
          academicYear: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        academicYear: null,
      });
    }
  });
});

// PUT method: update an academic year
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let academicYear = await AcademicYear.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (academicYear) {
        log(STATUSES.SUCCESS, "Update academic year successfully");
        res.status(200).json({
          message: message(
            STATUSES.SUCCESS,
            "Update academic year successfully"
          ),
          academicYear,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update academic year");
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update academic year"),
          academicYear: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        academicYear: null,
      });
    }
  });
});

// Export
export default router;
