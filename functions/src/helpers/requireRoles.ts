import { ROLES } from "../types";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { STATUSES } from "../common/statuses";
import { message } from "../util/log";

const requireRole = async (
  routeRoles: ROLES[],
  req: Request,
  res: Response,
  next: NextFunction,
  cb: (req: Request, res: Response, next: NextFunction) => void
) => {
  try {
    const user = await User.findOne({
      isHidden: false,
      email: req.body.user.email,
    }).exec();
    if (user) {
      if (!user.roles.some((r) => routeRoles.includes(r))) {
        return res.status(401).json({
          message: message(STATUSES.ERROR, "Permission denied"),
        });
      }
      cb(req, res, next);
    } else {
      res.status(404).json({
        message: message(STATUSES.ERROR, "Cannot find user"),
      });
    }
  } catch (error) {
    res.status(500).json({
      message: message(STATUSES.ERROR, error.message),
    });
  }
};

export default requireRole;
