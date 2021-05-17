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
const User_1 = __importDefault(require("../models/User"));
const Request_1 = __importDefault(require("../models/Request"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const requests = yield Request_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (requests.length) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all requests successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all requests successfully"),
                    count: requests.length,
                    requests,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get request");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get request"),
                    count: 0,
                    requests: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                requests: [],
            });
        }
    }));
});
router.get("/:userId", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById({
                _id: req.params.userId,
                isHidden: false,
            });
            const requests = yield Request_1.default.find(Object.assign({ isHidden: false, user: user._id }, req.query)).exec();
            if (requests.length) {
                log_1.default(statuses_1.STATUSES.SUCCESS, `Get all requests belongs to ${user._id} successfully`);
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, `Get all requests belongs to ${user._id} successfully`),
                    count: requests.length,
                    requests,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, `Cannot get requests belongs to ${user._id}`);
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, `Cannot get requests belongs to ${user._id}`),
                    count: 0,
                    requests: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                requests: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let request = new Request_1.default({
            lab: req.body.lab,
            status: req.body.status,
            user: req.body.uId,
            weekNo: req.body.weekNo,
            dayOfWeek: req.body.dayOfWeek,
            startPeriod: req.body.startPeriod,
            endPeriod: req.body.endPeriod,
            labUsage: req.body.labUsage,
            teaching: req.body.teaching,
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
        });
        try {
            request = yield request.save();
            if (request) {
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.CREATED, "Create new request successfully"),
                    request,
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                request: null,
            });
        }
    }));
}));
router.put("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let status = req.body.status;
            let request = yield Request_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, { $set: { status: status } }, { new: true });
            request = yield request.save();
            if (request) {
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.UPDATED, "Update request successfully"),
                    request,
                });
            }
            else {
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.UPDATED, "Cannot update request"),
                    request: null,
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.UPDATED, error.message),
                request: null,
            });
        }
    }));
}));
exports.default = router;
