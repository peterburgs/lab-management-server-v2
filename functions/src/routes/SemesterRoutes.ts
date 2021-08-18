import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, ISemester } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import Semester from "../models/Semester";
const router = Router();
router.use(requireAuth);

// GET method: get all semesters
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const { status } = req.query;
        const _status = Number(status);
        let semesters = [];
        if (Object.entries(req.query).length) {
          semesters = await Semester.find({
            isHidden: false,
            status: _status,
          }).exec();
        } else {
          semesters = await Semester.find({
            isHidden: false,
          }).exec();
        }
        if (semesters.length) {
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all semesters successfully"
            ),
            count: semesters.length,
            semesters,
          });
        } else {
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get semesters"),
            count: 0,
            semesters: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          semesters: [],
        });
      }
    }
  );
});

// POST method: create new semester
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let semester: ISemester = new Semester({
      academicYear: req.body.academicYear,
      index: req.body.index,
      semesterName: req.body.semesterName,
      numberOfWeeks: req.body.numberOfWeeks,
      status: req.body.status,
      startPracticalWeek: req.body.startPracticalWeek,
      isHidden: req.body.isHidden,
    });
    if (req.body.startDate) {
      semester.startDate = new Date(req.body.startDate);
    }
    try {
      semester = await semester.save();
      if (semester) {
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new semester successfully"
          ),
          semester,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new semester"),
          semester,
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

// PUT method: update a semester
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let semester = await Semester.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (semester) {
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update semester successfully"),
          semester,
        });
      } else {
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update semester"),
          semester: null,
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

export default router;
