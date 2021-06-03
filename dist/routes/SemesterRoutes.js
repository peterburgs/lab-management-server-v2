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
const requireAuth_1 = __importDefault(require("../helpers/requireAuth"));
const requireRoles_1 = __importDefault(require("../helpers/requireRoles"));
const Semester_1 = __importDefault(require("../models/Semester"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const semesters = yield Semester_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (semesters.length) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all semesters successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all semesters successfully"),
                    count: semesters.length,
                    semesters,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get semesters");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get semesters"),
                    count: 0,
                    semesters: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                semesters: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let semester = new Semester_1.default({
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
            semester = yield semester.save();
            if (semester) {
                log_1.default(statuses_1.STATUSES.CREATED, "Create new semester successfully");
                log_1.default(statuses_1.STATUSES.INFO, semester);
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.CREATED, "Create new semester successfully"),
                    semester,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot create new semester");
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create new semester"),
                    semester,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                semester: null,
            });
        }
    }));
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let semester = yield Semester_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, {
                $set: req.body,
            }, { new: true }).exec();
            if (semester) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Update semester successfully");
                log_1.default(statuses_1.STATUSES.INFO, semester);
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Update semester successfully"),
                    semester,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot update semester");
                res.status(422).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot update semester"),
                    semester: null,
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                semester: null,
            });
        }
    }));
}));
exports.default = router;
