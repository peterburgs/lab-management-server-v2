import mongoose from "mongoose";
import _ from "lodash";
import log from "./log";
import { STATUSES } from "../common/statuses";
import moment from "moment";
import LabUsage from "../models/LabUsage";
import Semester from "../models/Semester";
import { ILab, ITeaching } from "../types";

const scheduleGenerationV3 = async (
  ol: ILab[],
  nl: ILab[],
  ts: ITeaching[],
  si: string,
  nows: number,
  nops: number
) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      let smt = await Semester.findById({
        _id: si,
        isHidden: false,
      });
      let tq: ITeaching[] = [];
      ts.forEach((t) => tq.push(t));
      tq.sort((a, b) => b.numberOfStudents - a.numberOfStudents);
      let lq: ILab[] = [];
      ol.forEach((l) => lq.push(l));
      lq.sort((a, b) => b.capacity - a.capacity);
      nl.sort((a, b) => moment(a.createdAt!).diff(moment(b.createdAt)));
      nl.forEach((l) => lq.push(l));
      let { labSchedule } = smt!;
      if (!labSchedule || labSchedule.length <= 0) {
        labSchedule = Array(lq.length * nops + 1)
          .fill(0)
          .map(() => Array(nows * 7).fill(0));
      }
      while (tq.length) {
        let ct = tq.shift()!;
        let adfct: {
          weekNo: number;
          dayOfWeek: number;
          lab: string;
          currentDay: number;
        }[] = [];
        for (let i = 0; i < lq.length; i++) {
          for (let j = smt!.startPracticalWeek * 7; j < nows * 7; j++) {
            let cw = Math.floor(j / 7);
            if (cw < ct.startPracticalWeek) break;
            let cdow = j % 7;
            if (cdow == ct?.dayOfWeek) {
              if (adfct.filter((w) => w.weekNo == cw).length == 0) {
                if (adfct.filter((w) => w.weekNo + 1 == cw).length == 0) {
                  if (ct.numberOfPracticalWeeks > adfct.length) {
                    for (
                      let index = ct.startPeriod;
                      index <= ct.endPeriod;
                      index++
                    ) {
                      if (labSchedule[index + 15 * i][j] === 1) break;
                      if (index == ct.endPeriod) {
                        adfct.push({
                          weekNo: cw,
                          dayOfWeek: cdow,
                          lab: lq[i]._id,
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

        for (let item of adfct) {
          let labUsage = new LabUsage({
            semester: si,
            lab: item.lab,
            teaching: ct._id,
            weekNo: item.weekNo,
            dayOfWeek: item.dayOfWeek,
            startPeriod: ct.startPeriod,
            endPeriod: ct.endPeriod,
            isHidden: false,
          });
          for (let index = ct.startPeriod; index <= ct.endPeriod; index++) {
            labSchedule[
              index + 15 * lq.findIndex((lab) => lab._id == item.lab)
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
          _id: smt?._id,
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

export default scheduleGenerationV3;
