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
const types_1 = require("../types");
const teachingSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: false,
    },
    user: {
        type: String,
        ref: "User",
        required: true,
    },
    course: {
        type: String,
        ref: "Course",
        required: true,
    },
    group: {
        type: Number,
        required: true,
        min: 1,
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: types_1.DAY_OF_WEEKS.MONDAY,
        max: types_1.DAY_OF_WEEKS.SUNDAY,
    },
    startPeriod: {
        type: Number,
        required: true,
        min: types_1.PERIOD.ONE,
        max: types_1.PERIOD.SIXTEENTH,
    },
    endPeriod: {
        type: Number,
        required: true,
        min: types_1.PERIOD.ONE,
        max: types_1.PERIOD.SIXTEENTH,
    },
    numberOfStudents: {
        type: Number,
        required: true,
        min: 0,
    },
    numberOfPracticalWeeks: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
    },
    registration: {
        type: String,
        ref: "Registration",
        required: true,
    },
    theoryRoom: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    isHidden: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Teaching", teachingSchema);
