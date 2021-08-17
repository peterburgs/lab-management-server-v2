import mongoose from "mongoose";
import _ from "lodash";
import log, { message } from "./log";
import { STATUSES } from "../common/statuses";
import moment from "moment";
// Models
import LabUsage from "../models/LabUsage";
import Teaching from "../models/Teaching";
import Semester from "../models/Semester";

// Types
import { ILabUsage, ILab, ITeaching, ISemester } from "../types";

// Define
const scheduleGenerationV3 = async (
  oldLabs: ILab[],
  newLabs: ILab[],
  teachings: ITeaching[],
  semesterId: string,
  numberOfWeeks: number,
  numberOfPeriods: number
) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      let semester = await Semester.findById({
        _id: semesterId,
        isHidden: false,
      });
      let teachingQueue: ITeaching[] = [];
      teachings.forEach((t) => teachingQueue.push(t));
      teachingQueue.sort((a, b) => b.numberOfStudents - a.numberOfStudents);
      let labQueue: ILab[] = [];
      oldLabs.forEach((l) => labQueue.push(l));
      labQueue.sort((a, b) => b.capacity - a.capacity);
      newLabs.sort((a, b) => moment(a.createdAt!).diff(moment(b.createdAt)));
      newLabs.forEach((l) => labQueue.push(l));
      let { labSchedule } = semester!;
      if (!labSchedule || labSchedule.length <= 0) {
        labSchedule = Array(labQueue.length * numberOfPeriods + 1)
          .fill(0)
          .map(() => Array(numberOfWeeks * 7).fill(0));
      }

      while (teachingQueue.length) {
        let currentTeaching = teachingQueue.shift()!;
        let availableDaysForCurrentTeaching: {
          weekNo: number;
          dayOfWeek: number;
          lab: string;
          currentDay: number;
        }[] = [];
        for (let i = 0; i < labQueue.length; i++) {
          for (
            let j = semester!.startPracticalWeek * 7;
            j < numberOfWeeks * 7;
            j++
          ) {
            let currentWeek = Math.floor(j / 7);
            if (currentWeek < currentTeaching.startPracticalWeek) break;
            let currentDayOfWeek = j % 7;

            if (currentDayOfWeek == currentTeaching?.dayOfWeek) {
              if (
                availableDaysForCurrentTeaching.filter(
                  (w) => w.weekNo == currentWeek
                ).length == 0
              ) {
                if (
                  availableDaysForCurrentTeaching.filter(
                    (w) => w.weekNo + 1 == currentWeek
                  ).length == 0
                ) {
                  if (
                    currentTeaching.numberOfPracticalWeeks >
                    availableDaysForCurrentTeaching.length
                  ) {
                    for (
                      let index = currentTeaching.startPeriod;
                      index <= currentTeaching.endPeriod;
                      index++
                    ) {
                      if (labSchedule[index + 15 * i][j] === 1) break;
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
          let labUsage = new LabUsage({
            semester: semesterId,
            lab: item.lab,
            teaching: currentTeaching._id,
            weekNo: item.weekNo,
            dayOfWeek: item.dayOfWeek,
            startPeriod: currentTeaching.startPeriod,
            endPeriod: currentTeaching.endPeriod,
            isHidden: false,
          });
          for (
            let index = currentTeaching.startPeriod;
            index <= currentTeaching.endPeriod;
            index++
          ) {
            labSchedule[
              index + 15 * labQueue.findIndex((lab) => lab._id == item.lab)
            ][item.currentDay] = 1;
          }
          labUsage = await labUsage.save({ session });
          if (!labUsage) {
            await session.abortTransaction();
          }
        }
      }
      await Semester.findByIdAndUpdate(
        {
          _id: semester?._id,
          isHidden: false,
        },
        {
          $set: { labSchedule: labSchedule },
        },
        {
          new: true,
          session: session,
        }
      );
      await session.commitTransaction();
    });
  } catch (error) {
    log(STATUSES.ERROR, error.message);
  } finally {
    session.endSession();
  }
};

// Export
export default scheduleGenerationV3;
