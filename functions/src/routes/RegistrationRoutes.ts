import { Router } from "express";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";
import { ROLES, IRegistration } from "../types";
import requireAuth from "../helpers/requireAuth";
import requireRole from "../helpers/requireRoles";
import Registration from "../models/Registration";

const router = Router();
router.use(requireAuth);

// GET method: get all registrations
router.get("/", (req, res, next) => {
  requireRole(
    [ROLES.ADMIN, ROLES.LECTURER],
    req,
    res,
    next,
    async (req, res, next) => {
      try {
        const registrations = await Registration.find({
          isHidden: false,
          ...req.query,
        }).exec();
        if (registrations.length) {
          res.status(200).json({
            message: message(
              STATUSES.SUCCESS,
              "Get all registrations successfully"
            ),
            count: registrations.length,
            registrations,
          });
        } else {
          res.status(404).json({
            message: message(STATUSES.ERROR, "Cannot get registrations"),
            count: 0,
            registrations: [],
          });
        }
      } catch (error) {
        log(STATUSES.ERROR, error.message);
        res.status(500).json({
          message: message(STATUSES.ERROR, error.message),
          count: 0,
          registrations: [],
        });
      }
    }
  );
});

// POST method: create new registration
router.post("/", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    let registration: IRegistration = new Registration({
      batch: req.body.batch,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      isOpening: req.body.isOpening,
      semester: req.body.semester,
      isHidden: req.body.isHidden,
    });
    try {
      registration = await registration.save();
      if (registration) {
        res.status(201).json({
          message: message(
            STATUSES.CREATED,
            "Create new registration successfully"
          ),
          registration,
        });
      } else {
        res.status(500).json({
          message: message(STATUSES.ERROR, "Cannot create new registration"),
          registration: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        registration: null,
      });
    }
  });
});

// PUT method: update a registration
router.put("/:id", async (req, res, next) => {
  requireRole([ROLES.ADMIN], req, res, next, async (req, res, next) => {
    try {
      let registration = await Registration.findByIdAndUpdate(
        {
          _id: req.params.id,
          isHidden: false,
        },
        {
          $set: req.body,
        },
        { new: true }
      ).exec();
      if (registration) {
        res.status(200).json({
          message: message(
            STATUSES.SUCCESS,
            "Update registration successfully"
          ),
          registration,
        });
      } else {
        res.status(422).json({
          message: message(STATUSES.ERROR, "Cannot update registration"),
          registration: null,
        });
      }
    } catch (error) {
      log(STATUSES.ERROR, error.message);
      res.status(500).json({
        message: message(STATUSES.ERROR, error.message),
        registration: null,
      });
    }
  });
});

export default router;
