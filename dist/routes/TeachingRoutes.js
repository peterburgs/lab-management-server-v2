"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const log_1 = __importStar(require("../util/log"));
const statuses_1 = require("../common/statuses");
const types_1 = require("../types");
const requireAuth_1 = __importDefault(require("../helpers/requireAuth"));
const requireRoles_1 = __importDefault(require("../helpers/requireRoles"));
const Course_1 = __importDefault(require("../models/Course"));
const Teaching_1 = __importDefault(require("../models/Teaching"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const teachings = yield Teaching_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (teachings) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all teachings successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all teachings successfully"),
                    count: teachings.length,
                    teachings,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get teachings");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get teachings"),
                    count: 0,
                    teachings: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                teachings: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let teaching = new Teaching_1.default({
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
            isHidden: req.body.isHidden,
        });
        try {
            teaching = yield teaching.save();
            if (teaching) {
                log_1.default(statuses_1.STATUSES.CREATED, "Create new teaching successfully");
                log_1.default(statuses_1.STATUSES.INFO, teaching);
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.CREATED, "Create new teaching successfully"),
                    teaching,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot create new teaching");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create new teaching"),
                    teaching: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                teaching: null,
            });
        }
    }));
}));
router.post("/bulk", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let teachings = req.body.teachings;
        const session = yield mongoose_1.default.startSession();
        try {
            yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                for (let index = 0; index < teachings.length; index++) {
                    let course = yield Course_1.default.findOne({
                        _id: teachings[index].course,
                        isHidden: false,
                    }, null, { session });
                    if (!course) {
                        session.abortTransaction();
                    }
                    let teaching = new Teaching_1.default({
                        course: teachings[index].course,
                        group: teachings[index].group,
                        registration: teachings[index].registration,
                        user: teachings[index].user,
                        numberOfStudents: teachings[index].numberOfStudents,
                        theoryRoom: teachings[index].theoryRoom,
                        numberOfPracticalWeeks: teachings[index].numberOfPracticalWeeks,
                        dayOfWeek: teachings[index].dayOfWeek,
                        startPeriod: teachings[index].startPeriod,
                        endPeriod: teachings[index].endPeriod,
                        isHidden: teachings[index].isHidden,
                    });
                    teaching = yield teaching.save({ session });
                    if (!teaching) {
                        log_1.default(statuses_1.STATUSES.ERROR, "Cannot create teaching");
                        res.status(500).json({
                            message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create teaching"),
                            teachings: [],
                        });
                        session.abortTransaction();
                    }
                }
                yield session.commitTransaction();
                log_1.default(statuses_1.STATUSES.SUCCESS, "Create new teaching successfully");
                log_1.default(statuses_1.STATUSES.INFO, teachings);
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Create new Teaching successfully"),
                    teachings,
                });
            }));
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
            });
        }
        finally {
            session.endSession();
        }
    }));
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let teaching = yield Teaching_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: req.body,
            }, { new: true }).exec();
            if (teaching) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Update teaching successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Update teaching successfully"),
                    teaching,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot update teaching");
                res.status(422).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot update teaching"),
                    teaching: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                teaching: null,
            });
        }
    }));
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedTeaching = yield Teaching_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: { isHidden: true },
            }, { new: true }).exec();
            if (deletedTeaching) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Delete teaching successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Delete teaching successfully"),
                    teaching: deletedTeaching,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete teaching");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot delete teaching"),
                    teaching: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete teaching");
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                teaching: null,
            });
        }
    }));
}));
exports.default = router;
