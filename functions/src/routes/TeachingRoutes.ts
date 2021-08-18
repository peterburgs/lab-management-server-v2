import { Router } from "express";
import mongoose from "mongoose";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, ITeaching } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import Course from "../models/Course";
import Teaching from "../models/Teaching";

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
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all teachings successfully"
            ),
            count: teachings.length,
            teachings,
          });
        } else {
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
      code: req.body.code,
      user: req.body.uId,
      course: req.body.course,
      group: req.body.group,
      registration: req.body.registration,
      numberOfStudents: req.body.numberOfStudents,
      theoryRoom: req.body.theoryRoom,
      numberOfPracticalWeeks: req.body.numberOfPracticalWeeks,
      dayOfWeek: req.body.dayOfWeek,
      startPeriod: req.body.startPeriod,
      endPeriod: req.body.endPeriod,
      class: req.body.class,
      startPracticalWeek: req.body.startPracticalWeek,
      isHidden: req.body.isHidden,
    });
    try {
      teaching = await teaching.save();
      if (teaching) {
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new teaching successfully"
          ),
          teaching,
        });
      } else {
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
            code: teachings[index].code,
            course: teachings[index].course,
            group: teachings[index].group,
            registration: teachings[index].registration,
            user: teachings[index].uId,
            numberOfStudents: teachings[index].numberOfStudents,
            theoryRoom: teachings[index].theoryRoom,
            numberOfPracticalWeeks: teachings[index].numberOfPracticalWeeks,
            dayOfWeek: teachings[index].dayOfWeek,
            startPeriod: teachings[index].startPeriod,
            endPeriod: teachings[index].endPeriod,
            class: teachings[index].class,
            startPracticalWeek: teachings[index].startPracticalWeek,
            isHidden: teachings[index].isHidden,
          });
          teaching = await teaching.save({ session });
          teachings[index]._id = teaching._id;
          if (!teaching) {
            res.status(500).json({
              message: message(STATUSES.ERROR, "Cannot create teaching"),
              teachings: [],
            });
            session.abortTransaction();
          }
        }
        await session.commitTransaction();
        res.status(201).json({
          message: message(
            STATUSES.SUCCESS,
            "Create new Teaching successfully"
          ),
          teachings,
        });
      });
    } catch (error) {
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
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update teaching successfully"),
          teaching,
        });
      } else {
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
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete teaching successfully"),
          teaching: deletedTeaching,
        });
      } else {
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

export default router;
