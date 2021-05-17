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
const Comment_1 = __importDefault(require("../models/Comment"));
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => {
    requireRoles_1.default([types_1.ROLES.ADMIN, types_1.ROLES.LECTURER], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const comments = yield Comment_1.default.find(Object.assign({ isHidden: false }, req.query)).exec();
            if (comments.length) {
                log_1.default(statuses_1.STATUSES.SUCCESS, "Get all comments successfully");
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.SUCCESS, "Get all comments successfully"),
                    count: comments.length,
                    comments,
                });
            }
            else {
                log_1.default(statuses_1.STATUSES.ERROR, "Cannot get comments");
                res.status(404).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot get comments"),
                    count: 0,
                    comments: [],
                });
            }
        }
        catch (error) {
            log_1.default(statuses_1.STATUSES.ERROR, error.message);
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                count: 0,
                comments: [],
            });
        }
    }));
});
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER, types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        let comment = new Comment_1.default({
            user: req.body.uId,
            request: req.body.request,
            text: req.body.text,
        });
        try {
            comment = yield comment.save();
            if (comment) {
                res.status(201).json({
                    message: log_1.message(statuses_1.STATUSES.CREATED, "Create new comment successfully"),
                    comment,
                });
            }
            else {
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot create new comment"),
                    comment: null,
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                comment: null,
            });
        }
    }));
}));
router.post("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    requireRoles_1.default([types_1.ROLES.LECTURER, types_1.ROLES.ADMIN], req, res, next, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let deletedComment = yield Comment_1.default.findByIdAndUpdate({
                _id: req.params.id,
                isHidden: false,
            }, { $set: { isHidden: true } }, { new: true });
            if (deletedComment) {
                res.status(200).json({
                    message: log_1.message(statuses_1.STATUSES.DELETED, "Delete comment successfully"),
                    comment: deletedComment,
                });
            }
            else {
                res.status(500).json({
                    message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot delete comment"),
                    comment: null,
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
                comment: null,
            });
        }
    }));
}));
exports.default = router;
