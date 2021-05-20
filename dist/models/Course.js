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
const courseSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    numberOfCredits: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: types_1.COURSE_TYPES,
        required: true,
    },
    isHidden: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Course", courseSchema);
