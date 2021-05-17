import { Document } from "mongoose";
import { REQUEST_STATUSES } from "../common/requestStatuses";
import { REQUEST_TYPES } from "../common/requestTypes";
import { ACTIONS } from "../common/actions";
import { MODELS } from "../common/models";
export enum ROLES {
  ADMIN,
  LECTURER,
  STUDENT,
}

export enum DAY_OF_WEEKS {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}
export enum PERIOD {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  ELEVEN = 11,
  TWELVE = 12,
  THIRTEEN = 13,
  FOURTEEN = 14,
  FIFTEEN = 15,
}

export interface IUser extends Document {
  _id: string;
  email: string;
  fullName: string;
  roles: ROLES[];
  isHidden: boolean;
  avatarUrl: string;
}

export interface ISemester extends Document {
  semesterName: string;
  startDate: Date;
  numberOfWeeks: number;
  isOpening: boolean;
  isHidden: boolean;
  labSchedule: number[][];
}
export interface ITeaching extends Document {
  user: string;
  course: string;
  group: number;
  dayOfWeek: DAY_OF_WEEKS;
  startPeriod: PERIOD;
  endPeriod: PERIOD;
  numberOfStudents: number;
  theoryRoom: string;
  numberOfPracticalWeeks: number;
  registration: string;
  semester: string;
  isHidden: boolean;
}
export interface IRegistration extends Document {
  batch: number;
  startDate: Date;
  endDate: Date;
  isOpening: boolean;
  semester: string;
  isHidden: boolean;
}
export interface ICourse extends Document {
  _id: string;
  courseName: string;
  numberOfCredits: number;
  isHidden: boolean;
}
export interface IRegistrableCourse extends Document {
  registration: string;
  course: string;
}
export interface ILab extends Document {
  labName: string;
  capacity: number;
  isHidden: boolean;
}
export interface ILabUsage extends Document {
  lab: string;
  teaching: string;
  weekNo: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  isHidden: boolean;
  semester: string;
}
export interface IRequest extends Document {
  lab: string;
  status: REQUEST_STATUSES;
  user: string;
  weekNo: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  labUsage: string;
  teaching: string;
  title: string;
  description: string;
  type: REQUEST_TYPES;
  isHidden: boolean;
}

export interface IComment extends Document {
  user: string;
  request: string;
  text: string;
  isHidden: boolean;
}

export interface ISystemlog extends Document {
  user: string;
  action: ACTIONS;
  models: MODELS;
  modelId: string;
}
