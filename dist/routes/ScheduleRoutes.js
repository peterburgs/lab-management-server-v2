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
const log_1 = __importStar(require("../util/log"));
const statuses_1 = require("../common/statuses");
const types_1 = require("../types");
const scheduleGenerationV2_1 = __importDefault(require("../util/scheduleGenerationV2"));
const requireAuth_1 = __importDefault(require("../helpers/requireAuth"));
const requireRoles_1 = __importDefault(require("../helpers/requireRoles"));
const Semester_1 = __importDefault(require("../models/Semester"));
const Teaching_1 = __importDefault(require("../models/Teaching"));
const LabUsage_1 = __importDefault(require("../models/LabUsage"));
const Lab_1 = __importDefault(require("../models/Lab"));
const Registration_1 = __importDefault(require("../models/Registration"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const labUsages = yield LabUsage_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (labUsages) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all lab usages successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all lab usages successfully"),
                    count: labUsages.length,
                    labUsages,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get lab usages");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get lab usages"),
                    count: 0,
                    labUsages: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                labUsages: [],
            });
        }
    }));
});
router.post("/generate", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let registration = yield Registration_1.default.findById({
                _id: req.body.registration,
            });
            yield LabUsage_1.default.deleteMany({});
            let labs = yield Lab_1.default.find({ isHidden: false });
            let teachings = yield Teaching_1.default.find({
                registration: registration._id,
                isHidden: false,
            });
            let semester = yield Semester_1.default.findById({
                _id: registration.semester,
            });
            let _schedule = yield scheduleGenerationV2_1.default(labs, teachings, semester._id, semester.numberOfWeeks, types_1.PERIOD.FIFTEEN);
            res.status(201).json({
                message: log_1.message(statuses_1.STATUSES.SUCCESS, "Create schedule successfully"),
                schedule: null,
            });
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
            });
        }
    }));
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let labUsage = new LabUsage_1.default({
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
            labUsage = yield labUsage.save();
            if (!labUsage) {
                return res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create lab usage"),
                    labUsage: null,
                });
            }
            return res.status(201).json({
                message: log_1.message(statuses_1.STATUSES.SUCCESS, "Create new lab usage successfully"),
                labUsage,
            });
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.SUCCESS, "Cannot create new lab usage"),
                labUsage: null,
            });
        }
    }));
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let oldLabUsage = yield LabUsage_1.default.findById({
                _id: req.params.id,
                isHidden: false,
            });
            let semester = yield Semester_1.default.findById({
                _id: oldLabUsage.semester,
                isHidden: false,
            });
            let { labSchedule } = semester;
            let labs = yield Lab_1.default.find({ isHidden: false });
            labs.sort((a, b) => b.capacity - a.capacity);
            for (let i = oldLabUsage.startPeriod; i <= oldLabUsage.endPeriod; i++) {
                labSchedule[i + 15 * labs.findIndex((lab) => lab._id == oldLabUsage.lab)][oldLabUsage.weekNo * 7 + oldLabUsage.dayOfWeek] = 0;
            }
            let newLabUsage = yield LabUsage_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, { $set: req.body }, { new: true });
            for (let i = newLabUsage.startPeriod; i <= newLabUsage.endPeriod; i++) {
                labSchedule[i + 15 * labs.findIndex((lab) => lab._id == newLabUsage.lab)][newLabUsage.weekNo * 7 + newLabUsage.dayOfWeek] = 1;
            }
            semester.labSchedule = labSchedule;
            semester = yield semester.save();
            if (semester) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Update semester, lab schedule successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Update semester, lab schedule successfully"),
                    labUsage: newLabUsage,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot update semester, lab schedule");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot update semester, lab schedule successfully"),
                    labUsage: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                LabUsage: null,
            });
        }
    }));
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deletedLabUsage = yield LabUsage_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: { isHidden: true },
            }, { new: true }).exec();
            if (deletedLabUsage) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Delete labUsage successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Delete labUsage successfully"),
                    labUsage: deletedLabUsage,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete labUsage");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot delete labUsage"),
                    labUsage: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, "Cannot delete labUsage");
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                labUsage: null,
            });
        }
    }));
}));
exports.default = router;
