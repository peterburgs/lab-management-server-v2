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
const Registration_1 = __importDefault(require("../models/Registration"));
const RegistrableCourse_1 = __importDefault(require("../models/RegistrableCourse"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const registrableCourses = yield RegistrableCourse_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (registrableCourses) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all Registrable Courses successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all Registrable Courses successfully"),
                    count: registrableCourses.length,
                    registrableCourses,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get Registrable Courses");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get Registrable Courses"),
                    count: 0,
                    registrableCourses: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                registrableCourses: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let registrableCourses = req.body.registrableCourses;
        const session = yield mongoose_1.default.startSession();
        try {
            yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
                for (let index = 0; index < registrableCourses.length; index++) {
                    let registration = yield Registration_1.default.findOne({
                        _id: registrableCourses[index].registration,
                        isHidden: false,
                    }, null, { session });
                    if (!registration) {
                        session.abortTransaction();
                    }
                    let course = yield Course_1.default.findOne({
                        _id: registrableCourses[index].course,
                        isHidden: false,
                    }, null, { session });
                    if (!course) {
                        session.abortTransaction();
                    }
                    let registrableCourse = new RegistrableCourse_1.default({
                        registration: registrableCourses[index].registration,
                        course: registrableCourses[index].course,
                    });
                    try {
                        registrableCourse = yield registrableCourse.save({ session });
                        if (registrableCourse) {
                            log_1.default(statuses_1.STATUSES.CREATED, `Create new Registrable Course ${[index]} successfully`);
                        }
                        else {
                            log_1.default(statuses_1.STATUSES.ERROR, `Cannot create Registrable Courses`);
                            res.status(500).json({
                                message: log_1.message(statuses_1.STATUSES.ERROR, `Cannot create Registrable Courses`),
                                registrableCourse: null,
                            });
                            session.abortTransaction();
                        }
                    }
                    catch (error) {
                        log_1.default(statuses_1.STATUSES.ERROR, error.message);
                        res.status(500).json({
                            message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                            registrableCourse: null,
                        });
                        session.abortTransaction();
                    }
                }
                yield session.commitTransaction();
            }));
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                registrableCourses: [],
            });
        }
        finally {
            yield session.endSession();
        }
        res.status(201).json({
            message: log_1.message(statuses_1.STATUSES.CREATED, "Create Registrable courses successfully"),
        });
    }));
}));
exports.default = router;
