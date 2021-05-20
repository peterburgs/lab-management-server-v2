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
const mongoose_1 = __importDefault(require("mongoose"));
const log_1 = __importDefault(require("./log"));
const statuses_1 = require("../common/statuses");
const LabUsage_1 = __importDefault(require("../models/LabUsage"));
const Semester_1 = __importDefault(require("../models/Semester"));
const scheduleGenerationV2 = (labs, teachings, semesterId, numberOfWeeks, numberOfPeriods) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            let semester = yield Semester_1.default.findById({
                _id: semesterId,
                isHidden: false,
            });
            let teachingQueue = [];
            teachings.forEach((t) => teachingQueue.push(t));
            teachingQueue.sort((a, b) => b.numberOfStudents - a.numberOfStudents);
            let labQueue = [];
            labs.forEach((l) => labQueue.push(l));
            labQueue.sort((a, b) => b.capacity - a.capacity);
            let { labSchedule } = semester;
            if (!labSchedule || labSchedule.length <= 0) {
                labSchedule = Array(labs.length * numberOfPeriods + 1)
                    .fill(0)
                    .map(() => Array(numberOfWeeks * 7).fill(0));
            }
            console.log(teachingQueue);
            console.log("===");
            while (teachingQueue.length) {
                let currentTeaching = teachingQueue.shift();
                console.log(currentTeaching);
                let availableDaysForCurrentTeaching = [];
                for (let i = 0; i < labQueue.length; i++) {
                    for (let j = 14; j < numberOfWeeks * 7; j++) {
                        let currentWeek = Math.floor(j / 7);
                        let currentDayOfWeek = j % 7;
                        if (currentDayOfWeek == (currentTeaching === null || currentTeaching === void 0 ? void 0 : currentTeaching.dayOfWeek)) {
                            if (availableDaysForCurrentTeaching.filter((w) => w.weekNo == currentWeek).length == 0) {
                                if (availableDaysForCurrentTeaching.filter((w) => w.weekNo + 1 == currentWeek).length == 0) {
                                    if (currentTeaching.numberOfPracticalWeeks >
                                        availableDaysForCurrentTeaching.length) {
                                        for (let index = currentTeaching.startPeriod; index <= currentTeaching.endPeriod; index++) {
                                            if (labSchedule[index + 15 * i][j] === 1)
                                                break;
                                            if (index == currentTeaching.endPeriod) {
                                                availableDaysForCurrentTeaching.push({
                                                    weekNo: currentWeek,
                                                    dayOfWeek: currentDayOfWeek,
                                                    lab: labQueue[i]._id,
                                                    currentDay: j,
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (let item of availableDaysForCurrentTeaching) {
                    let labUsage = new LabUsage_1.default({
                        semester: semesterId,
                        lab: item.lab,
                        teaching: currentTeaching._id,
                        weekNo: item.weekNo,
                        dayOfWeek: item.dayOfWeek,
                        startPeriod: currentTeaching.startPeriod,
                        endPeriod: currentTeaching.endPeriod,
                        isHidden: false,
                    });
                    for (let index = currentTeaching.startPeriod; index <= currentTeaching.endPeriod; index++) {
                        labSchedule[index + 15 * labQueue.findIndex((lab) => lab._id == item.lab)][item.currentDay] = 1;
                    }
                    labUsage = yield labUsage.save({ session });
                    if (!labUsage) {
                        yield session.abortTransaction();
                    }
                }
            }
            yield session.commitTransaction();
            semester.labSchedule = labSchedule;
            yield semester.save({ session });
        }));
    }
    catch (error) {
        log_1.default(statuses_1.STATUSES.ERROR, error.message);
    }
    finally {
        session.endSession();
    }
});
exports.default = scheduleGenerationV2;
