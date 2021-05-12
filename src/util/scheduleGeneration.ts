import mongoose from "mongoose";
import _ from "lodash";
import log, { message } from "../util/log";
import { STATUSES } from "../common/statuses";

// Models
import LabUsage from "../models/LabUsage";
import Teaching from "../models/Teaching";
import Semester from "../models/Semester";

// Types
import { ILabUsage, ILab, ITeaching, ISemester } from "../types";

// Define
const schedule = async (
  labs: ILab[],
  teachings: ITeaching[],
  semesterId: string,
  numberOfWeeks: number,
  numberOfPeriods: number,
  isNew: boolean
) => {
  try {
    let tq: ITeaching[] = [];
    let lq: ILab[] = [];
    teachings.forEach((e) => tq.push(e));
    labs.forEach((e) => lq.push(e));
    tq.sort((a, b) => b.numberOfStudents - a.numberOfStudents);
    lq.sort((a, b) => b.capacity - a.capacity);
    let labSchedule: number[][] = [];
    let semester = await Semester.findOne({ _id: semesterId, isHidden: false });
    if (isNew)
      labSchedule = Array(numberOfWeeks * 7)
        .fill(0)
        .map(() => Array(labs.length * numberOfPeriods).fill(0));
    else labSchedule = _.cloneDeep(semester!.labSchedule);
    while (tq.length) {
      let currentTeaching = tq.shift();
      for (let i = 0; i < lq.length; i++) {
        let isAvailable = -1;
        let breakDay = false;
        for (let j = 0; j < numberOfWeeks * 7; j++) {
          if (!breakDay) {
            if (j % 7 == currentTeaching?.dayOfWeek) {
              for (
                let period = currentTeaching.startPeriod;
                period <= currentTeaching.endPeriod;
                period++
              ) {
                if (labSchedule[period + numberOfPeriods * i][j] != 0) break;
                isAvailable = j;
                breakDay = true;
              }
            }
          }

          if (
            isAvailable !== -1 &&
            currentTeaching!.numberOfPracticalWeeks * 14 + isAvailable <=
              numberOfWeeks * 7
          ) {
            let currentDay = isAvailable;
            while (currentTeaching!.numberOfPracticalWeeks--) {
              let _labUsage = new LabUsage({
                lab: lq[i]._id,
                teaching: currentTeaching!._id,
                weekNo: Math.floor(currentDay / 7),
                dayOfWeek: currentTeaching!.dayOfWeek,
                startPeriod: currentTeaching!.startPeriod,
                endPeriod: currentTeaching!.endPeriod,
                isHidden: false,
              });
              _labUsage = await _labUsage.save();
              const teaching = await Teaching.findOne({
                _id: currentTeaching!._id,
              });
            }
            for (
              let currentSchedulePeriod = currentTeaching!.startPeriod;
              currentSchedulePeriod <= currentTeaching!.endPeriod;
              currentSchedulePeriod++
            )
              labSchedule[currentSchedulePeriod + 15 * i][currentDay] = 1;
            currentDay += 14;
          }
          break;
        }
      }
    }
    semester!.labSchedule = labSchedule;
    await semester!.save();
    log(STATUSES.SUCCESS, "Create schedule successfully");
    return labSchedule;
  } catch (error) {
    log(STATUSES.ERROR, error.message);
  }
};

// Export
export default schedule;
