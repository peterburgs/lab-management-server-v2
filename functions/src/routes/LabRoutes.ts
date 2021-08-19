import mongoose from "mongoose";
import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { PERIOD } from "../types";
import { ROLES, ILab, ISemester } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import { SEMESTER_STATUSES } from "../common/semesterStatuses";
import Lab from "../models/Lab";
import Semester from "../models/Semester";

const router = Router();
router.use(requireAuth);

// GET method: get all labs
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const labs = await Lab.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (labs.length) {
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all labs successfully"),
            count: labs.length,
            labs,
          });
        } else {
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get labs"),
            count: 0,
            labs: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          labs: [],
        });
      }
    }
  );
});

// POST method: create new lab
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    const isAvailableForCurrentUsing = req.body.isAvailableForCurrentUsing;
    if (!isAvailableForCurrentUsing) {
      let semester: ISemester | null = await Semester.findOne({
        status: SEMESTER_STATUSES.OPENING,
      });
      if (semester) {
        let { labSchedule } = semester;

        let extra = Array(PERIOD.SIXTEENTH)
          .fill(0)
          .map(() => Array(semester!.numberOfWeeks * 7).fill(0));
        labSchedule = labSchedule.concat(extra);
        semester.labSchedule = labSchedule;
        semester = await semester.save();
      }
    }
    let lab: ILab = new Lab({
      labName: req.body.labName,
      capacity: req.body.capacity,
      description: req.body.description,
      isAvailableForCurrentUsing: req.body.isAvailableForCurrentUsing,
      isHidden: req.body.isHidden,
    });
    try {
      lab = await lab.save();
      if (lab) {
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new lab successfully"),
          lab,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new lab"),
          lab: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      if (error.code === 11000) {
        res.status(500).json({
          message: message(STATUSES.ERROR, "There was a duplicated record"),
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Invalid data"),
        });
      }
    }
  });
});

// POST method: create many labs
router.post("/bulk", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let labs = req.body.labs;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (let index = 0; index < labs.length; index++) {
          let lab: ILab = new Lab({
            labName: labs[index].labName,
            capacity: labs[index].capacity,
            description: labs[index].description,
            isHidden: labs[index].isHidden,
            isAvailableForCurrentUsing: labs[index].isAvailableForCurrentUsing,
          });
          lab = await lab.save({ session });
          labs[index]._id = lab._id;
          if (!lab) {
            res.status(500).json({
              message: message(STATUSES.ERROR, "Cannot create lab"),
              labs: [],
            });
            session.abortTransaction();
          }
        }
        await session.commitTransaction();
        res.status(201).json({
          message: message(STATUSES.SUCCESS, "Create new lab successfully"),
        });
      });
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      if (error.code === 11000) {
        res.status(500).json({
          message: message(STATUSES.ERROR, "There was a duplicated record"),
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot validate data from file"),
        });
      }
    } finally {
      session.endSession();
    }
  });
});

// PUT method: update a lab
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let lab = await Lab.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (lab) {
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update lab successfully"),
          lab,
        });
      } else {
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update lab"),
          lab: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      if (error.code === 11000) {
        res.status(500).json({
          message: message(STATUSES.ERROR, "There was a duplicated record"),
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Invalid data"),
        });
      }
    }
  });
});

// DELETE method: delete a lab
router.delete("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const deletedLab = await Lab.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: { isHidden: true },
        },
        { new: true }
      ).exec();
      if (deletedLab) {
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete lab successfully"),
          lab: deletedLab,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot delete lab"),
          lab: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, "Cannot delete lab");
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        lab: null,
      });
    }
  });
});

export default router;
