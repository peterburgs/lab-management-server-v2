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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AcademicYear_1 = __importDefault(require("./AcademicYear"));
const semesterStatuses_1 = require("../common/semesterStatuses");
const semesterSchema = new mongoose_1.Schema({
    academicYear: {
        type: String,
        ref: AcademicYear_1.default,
        required: true,
    },
    semesterName: {
        type: String,
        required: true,
        default: "New Semester",
    },
    index: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
    },
    numberOfWeeks: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: semesterStatuses_1.SEMESTER_STATUSES,
        required: true,
        default: true,
    },
    labSchedule: {
        type: Array,
        required: false,
    },
    startPracticalWeek: {
        type: Number,
        required: true,
    },
    isHidden: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Semester", semesterSchema);
