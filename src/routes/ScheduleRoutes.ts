import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, ILabUsage, PERIOD, ISemester } from "../types";
import ScheduleGeneration from "../util/scheduleGeneration";
import scheduleGenerationV2 from "../util/scheduleGenerationV2";
// Middleware
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import Semester from "../models/Semester";
import Teaching from "../models/Teaching";
import LabUsage from "../models/LabUsage";
import Lab from "../models/Lab";
import Registration from "../models/Registration";

// Config router
const router = Router();
router.use(requireAuth);

// GET method: get all lab usages
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const labUsages = await LabUsage.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (labUsages) {
          log(STATUSES.SUCCESS, "Get all lab usages successfully");
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all lab usages successfully"
            ),
            count: labUsages.length,
            labUsages,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get lab usages");
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get lab usages"),
            count: 0,
            labUsages: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          labUsages: [],
        });
      }
    }
  );
});

// POST method: generate new schedule
router.post("/generate", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    // Apply algorithms to generate schedule
    try {
      let registration = await Registration.findById({
        _id: req.body.registration,
      });
      await LabUsage.deleteMany({});
      let labs = await Lab.find({ isHidden: false });
      let teachings = await Teaching.find({
        registration: registration!._id,
        isHidden: false,
      });
      let semester = await Semester.findById({
        _id: registration!.semester,
      });
      let _schedule = await scheduleGenerationV2(
        labs,
        teachings,
        semester!._id,
        semester!.numberOfWeeks,
        PERIOD.FIFTEEN
      );
      res.status(201).json({
        message: message(STATUSES.SUCCESS, "Create schedule successfully"),
        schedule: null,
      });
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
      });
    }
  });
});

// POST method: generate new lab usage
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let labUsage: ILabUsage = new LabUsage({
      lab: req.body.lab,
      teaching: req.body.teaching,
      weekNo: req.body.weekNo,
      dayOfWeek: req.body.dayOfWeek,
      startPeriod: req.body.startPeriod,
      endPeriod: req.body.endPeriod,
      isHidden: req.body.isHidden,
      semester: req.body.semester,
    });
    try {
      labUsage = await labUsage.save();
      if (!labUsage) {
        return res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create lab usage"),
          labUsage: null,
        });
      }
      return res.status(201).json({
        message: message(STATUSES.SUCCESS, "Create new lab usage successfully"),
        labUsage,
      });
    } catch (error) {
      res.status(500).json({
        message: message(STATUSES.SUCCESS, "Cannot create new lab usage"),
        labUsage: null,
      });
    }
  });
});

// PUT method: update a labUsage
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      // TODO: Find old lab usage
      let oldLabUsage = await LabUsage.findById({
        _id: req.params.id,
        isHidden: false,
      });
      // TODO: get lab schedule
      let semester = await Semester.findById({
        _id: oldLabUsage!.semester,
        isHidden: false,
      });
      let { labSchedule } = semester!;
      // TODO: get all labs
      let labs = await Lab.find({ isHidden: false });
      labs.sort((a, b) => b.capacity - a.capacity);
      // TODO: change 1 values to zero
      for (let i = oldLabUsage!.startPeriod; i <= oldLabUsage!.endPeriod; i++) {
        labSchedule[
          i + 15 * labs.findIndex((lab) => lab._id == oldLabUsage!.lab)
        ][oldLabUsage!.weekNo * 7 + oldLabUsage!.dayOfWeek] = 0;
      }

      // TODO: Find new lab usage
      let newLabUsage = await LabUsage.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        { $set: req.body },
        { new: true }
      );

      // TODO: change 0 values to 1
      for (let i = newLabUsage!.startPeriod; i <= newLabUsage!.endPeriod; i++) {
        labSchedule[
          i + 15 * labs.findIndex((lab) => lab._id == newLabUsage!.lab)
        ][newLabUsage!.weekNo * 7 + newLabUsage!.dayOfWeek] = 1;
      }
      // TODO: update
      semester!.labSchedule = labSchedule;
      semester = await semester!.save();
      if (semester) {
        log(STATUSES.SUCCESS, "Update semester, lab schedule successfully");
        res.status(200).json({
          message: message(
            STATUSES.SUCCESS,
            "Update semester, lab schedule successfully"
          ),
          labUsage: newLabUsage,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update semester, lab schedule");
        res.status(200).json({
          message: message(
            STATUSES.ERROR,
            "Cannot update semester, lab schedule successfully"
          ),
          labUsage: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        LabUsage: null,
      });
    }
  });
});

// DELETE method: delete a labUsage
router.delete("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      const deletedLabUsage = await LabUsage.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: { isHidden: true },
        },
        { new: true }
      ).exec();
      if (deletedLabUsage) {
        log(STATUSES.SUCCESS, "Delete labUsage successfully");
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete labUsage successfully"),
          labUsage: deletedLabUsage,
        });
      } else {
        log(STATUSES.ERROR, "Cannot delete labUsage");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot delete labUsage"),
          labUsage: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, "Cannot delete labUsage");
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        labUsage: null,
      });
    }
  });
});

// Export
export default router;
