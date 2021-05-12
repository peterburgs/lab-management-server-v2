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
const lodash_1 = __importDefault(require("lodash"));
const log_1 = __importDefault(require("../util/log"));
const statuses_1 = require("../common/statuses");
const LabUsage_1 = __importDefault(require("../models/LabUsage"));
const Teaching_1 = __importDefault(require("../models/Teaching"));
const Semester_1 = __importDefault(require("../models/Semester"));
const schedule = (labs, teachings, semesterId, numberOfWeeks, numberOfPeriods, isNew) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tq = [];
        let lq = [];
        teachings.forEach((e) => tq.push(e));
        labs.forEach((e) => lq.push(e));
        tq.sort((a, b) => b.numberOfStudents - a.numberOfStudents);
        lq.sort((a, b) => b.capacity - a.capacity);
        let labSchedule = [];
        let semester = yield Semester_1.default.findOne({ _id: semesterId, isHidden: false });
        if (isNew)
            labSchedule = Array(numberOfWeeks * 7)
                .fill(0)
                .map(() => Array(labs.length * numberOfPeriods).fill(0));
        else
            labSchedule = lodash_1.default.cloneDeep(semester.labSchedule);
        while (tq.length) {
            let currentTeaching = tq.shift();
            for (let i = 0; i < lq.length; i++) {
                let isAvailable = -1;
                let breakDay = false;
                for (let j = 0; j < numberOfWeeks * 7; j++) {
                    if (!breakDay) {
                        if (j % 7 == (currentTeaching === null || currentTeaching === void 0 ? void 0 : currentTeaching.dayOfWeek)) {
                            for (let period = currentTeaching.startPeriod; period <= currentTeaching.endPeriod; period++) {
                                if (labSchedule[period + numberOfPeriods * i][j] != 0)
                                    break;
                                isAvailable = j;
                                breakDay = true;
                            }
                        }
                    }
                    if (isAvailable !== -1 &&
                        currentTeaching.numberOfPracticalWeeks * 14 + isAvailable <=
                            numberOfWeeks * 7) {
                        let currentDay = isAvailable;
                        while (currentTeaching.numberOfPracticalWeeks--) {
                            let _labUsage = new LabUsage_1.default({
                                lab: lq[i]._id,
                                teaching: currentTeaching._id,
                                weekNo: Math.floor(currentDay / 7),
                                dayOfWeek: currentTeaching.dayOfWeek,
                                startPeriod: currentTeaching.startPeriod,
                                endPeriod: currentTeaching.endPeriod,
                                isHidden: false,
                            });
                            _labUsage = yield _labUsage.save();
                            const teaching = yield Teaching_1.default.findOne({
                                _id: currentTeaching._id,
                            });
                        }
                        for (let currentSchedulePeriod = currentTeaching.startPeriod; currentSchedulePeriod <= currentTeaching.endPeriod; currentSchedulePeriod++)
                            labSchedule[currentSchedulePeriod + 15 * i][currentDay] = 1;
                        currentDay += 14;
                    }
                    break;
                }
            }
        }
        semester.labSchedule = labSchedule;
        yield semester.save();
        log_1.default(statuses_1.STATUSES.SUCCESS, "Create schedule successfully");
        return labSchedule;
    }
    catch (error) {
        log_1.default(statuses_1.STATUSES.ERROR, error.message);
    }
});
exports.default = schedule;
