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
const express_1 = require("express");
const log_1 = __importDefault(require("../util/log"));
const statuses_1 = require("../common/statuses");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find(Object.assign({ isHidden: false }, req.params)).exec();
        if (users) {
            log_1.default(statuses_1.STATUSES.SUCCESS, "All users have been found");
            res.status(200).json({
                message: "All users have been found",
                count: users.length,
                users,
            });
        }
        else {
            log_1.default(statuses_1.STATUSES.SUCCESS, "No user found");
            res.status(404).json({
                message: "No user found",
                count: 0,
                users: [],
            });
        }
    }
    catch (error) {
        log_1.default(statuses_1.STATUSES.ERROR, error.message);
        res.status(500).json({
            message: error.message,
            count: 0,
            users: [],
        });
    }
}));
exports.default = router;
