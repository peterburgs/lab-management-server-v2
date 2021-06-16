"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const statuses_1 = require("../common/statuses");
const log_1 = require("../util/log");
const requireRole = (routeRoles, req, res, next, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({
            isHidden: false,
            email: req.body.user.email,
        }).exec();
        if (user) {
            if (!user.roles.some((r) => routeRoles.includes(r))) {
                console.log("Permission denied");
                return res.status(401).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Permission denied"),
                });
            }
            cb(req, res, next);
        }
        else {
            res.status(404).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot find user"),
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
        });
    }
});
exports.default = requireRole;
