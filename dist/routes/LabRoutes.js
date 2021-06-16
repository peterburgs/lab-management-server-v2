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
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("express");
const log_1 = __importStar(require("../util/log"));
const statuses_1 = require("../common/statuses");
const types_1 = require("../types");
const types_2 = require("../types");
const requireAuth_1 = __importDefault(require("../helpers/requireAuth"));
const requireRoles_1 = __importDefault(require("../helpers/requireRoles"));
const semesterStatuses_1 = require("../common/semesterStatuses");
const Lab_1 = __importDefault(require("../models/Lab"));
const Semester_1 = __importDefault(require("../models/Semester"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_2.ROLES.ADMIN, types_2.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const labs = yield Lab_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (labs.length) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all labs successfully");
                log_1.default(statuses_1.STATUSES.INFO, labs);
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all labs successfully"),
                    count: labs.length,
                    labs,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get labs");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get labs"),
                    count: 0,
                    labs: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                labs: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_2.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const isAvailableForCurrentUsing = req.body.isAvailableForCurrentUsing;
        console.log(isAvailableForCurrentUsing);
        if (!isAvailableForCurrentUsing) {
            let semester = yield Semester_1.default.findOne({
                status: semesterStatuses_1.SEMESTER_STATUSES.OPENING,
            });
            if (semester) {
                let { labSchedule } = semester;
                let extra = Array(types_1.PERIOD.SIXTEENTH)
                    .fill(0)
                    .map(() => Array(semester.numberOfWeeks * 7).fill(0));
                labSchedule = labSchedule.concat(extra);
                semester.labSchedule = labSchedule;
                semester = yield semester.save();
                console.log("*** Hello World");
            }
        }
        let lab = new Lab_1.default({
            labName: req.body.labName,
            capacity: req.body.capacity,
            isAvailableForCurrentUsing: req.body.isAvailableForCurrentUsing,
            isHidden: req.body.isHidden,
        });
        try {
            lab = yield lab.save();
            if (lab) {
                log_1.default(statuses_1.STATUSES.CREATED, "Create new lab successfully");
                log_1.default(statuses_1.STATUSES.INFO, lab);
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.CREATED, "Create new lab successfully"),
                    lab,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot create new lab");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create new lab"),
                    lab: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                lab: null,
            });
        }
    }));
}));
router.post("/bulk", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_2.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let labs = req.body.labs;
        const session = yield mongoose_1.default.startSession();
        try {
            yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                for (let index = 0; index < labs.length; index++) {
                    let lab = new Lab_1.default({
                        labName: labs[index].labName,
                        capacity: labs[index].capacity,
                        isHidden: labs[index].isHidden,
                        isAvailableForCurrentUsing: labs[index].isAvailableForCurrentUsing,
                    });
                    lab = yield lab.save({ session });
                    labs[index]._id = lab._id;
                    if (!lab) {
                        log_1.default(statuses_1.STATUSES.ERROR, "Cannot create lab");
                        res.status(500).json({
                            message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create lab"),
                            labs: [],
                        });
                        session.abortTransaction();
                    }
                }
                yield session.commitTransaction();
                log_1.default(statuses_1.STATUSES.SUCCESS, "Create new lab successfully");
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Create new lab successfully"),
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
    requireRoles_1.default([types_2.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let lab = yield Lab_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: req.body,
            }, { new: true }).exec();
            if (lab) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Update lab successfully");
                log_1.default(statuses_1.STATUSES.INFO, lab);
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Update lab successfully"),
                    lab,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot update lab");
                res.status(422).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot update lab"),
                    lab: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                lab: null,
            });
        }
    }));
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_2.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedLab = yield Lab_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: { isHidden: true },
            }, { new: true }).exec();
            if (deletedLab) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Delete lab successfully");
                log_1.default(statuses_1.STATUSES.INFO, deletedLab);
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Delete lab successfully"),
                    lab: deletedLab,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete lab");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot delete lab"),
                    lab: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete lab");
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                lab: null,
            });
        }
    }));
}));
exports.default = router;
