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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const requestStatuses_1 = require("../common/requestStatuses");
const requestTypes_1 = require("../common/requestTypes");
const requestSchema = new mongoose_1.Schema({
    lab: {
        type: String,
        ref: "Lab",
        required: true,
    },
    status: {
        type: requestStatuses_1.REQUEST_STATUSES,
        required: true,
    },
    user: {
        type: String,
        ref: "User",
        required: true,
    },
    weekNo: {
        type: Number,
        required: true,
        min: 0,
    },
    dayOfWeek: {
        type: Number,
        min: 0,
    },
    startPeriod: {
        type: Number,
        min: 0,
    },
    endPeriod: {
        type: Number,
        min: 0,
    },
    labUsage: {
        type: String,
        ref: "LabUsage",
    },
    teaching: {
        type: String,
        ref: "Teaching",
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: requestTypes_1.REQUEST_TYPES,
        required: true,
    },
    isHidden: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Request", requestSchema);
