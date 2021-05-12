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
const requireAuth_1 = __importDefault(require("../helpers/requireAuth"));
const User_1 = __importDefault(require("../models/User"));
const log_1 = __importStar(require("../util/log"));
const statuses_1 = require("../common/statuses");
const router = express_1.Router();
router.use(requireAuth_1.default);
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({
            email: req.body.user.email,
            isHidden: false,
        });
        if (!user) {
            log_1.default(statuses_1.STATUSES.ERROR, "Cannot find user with email " + req.body.user.email);
            return res.status(404).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, "Cannot find user with email " + req.body.user.email),
                verifiedUser: null,
                avatarUrl: null,
                verifiedRole: null,
                verifiedToken: null,
            });
        }
        if (user.roles.includes(Number(req.query.role))) {
            log_1.default(statuses_1.STATUSES.INFO, req.body.user);
            res.status(200).json({
                verifiedUser: {
                    fullName: user.fullName,
                    email: user.email,
                },
                avatarUrl: req.body.user.picture,
                verifiedRole: req.query.role,
                verifiedToken: req.headers.authorization,
            });
        }
        else {
            res.status(500).json({
                message: log_1.message(statuses_1.STATUSES.ERROR, "Role of user is not allowed"),
                verifiedUser: null,
                avatarUrl: null,
                verifiedRole: null,
                verifiedToken: null,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: log_1.message(statuses_1.STATUSES.ERROR, error.message),
            verifiedUser: null,
            avatarUrl: null,
            verifiedRole: null,
            verifiedToken: null,
        });
    }
}));
exports.default = router;
