import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, ILab } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";

// Import models
import Lab from "../models/Lab";

// Config router
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
          log(STATUSES.SUCCESS, "Get all labs successfully");
          log(STATUSES.INFO, labs);
          res.status(200).json({
            message: message(STATUSES.SUCCESS, "Get all labs successfully"),
            count: labs.length,
            labs,
          });
        } else {
          log(STATUSES.ERROR, "Cannot get labs");
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
    let lab: ILab = new Lab({
      labName: req.body.labName,
      capacity: req.body.capacity,
      isHidden: req.body.isHidden,
    });
    try {
      lab = await lab.save();
      if (lab) {
        log(STATUSES.CREATED, "Create new lab successfully");
        log(STATUSES.INFO, lab);
        res.status(201).json({
          message: message(STATUSES.CREATED, "Create new lab successfully"),
          lab,
        });
      } else {
        log(STATUSES.ERROR, "Cannot create new lab");
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new lab"),
          lab: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        lab: null,
      });
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
        log(STATUSES.SUCCESS, "Update lab successfully");
        log(STATUSES.INFO, lab);
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Update lab successfully"),
          lab,
        });
      } else {
        log(STATUSES.ERROR, "Cannot update lab");
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update lab"),
          lab: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        lab: null,
      });
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
        log(STATUSES.SUCCESS, "Delete lab successfully");
        log(STATUSES.INFO, deletedLab);
        res.status(200).json({
          message: message(STATUSES.SUCCESS, "Delete lab successfully"),
          lab: deletedLab,
        });
      } else {
        log(STATUSES.ERROR, "Cannot delete lab");
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

// Export
export default router;
