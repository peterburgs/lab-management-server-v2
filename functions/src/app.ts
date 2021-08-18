import express, { Request, Response, NextFunction, Application } from "express";
import connect from "./connect";
import log from "./util/log";
import morgan from "morgan";
import cors from "cors";
import * as functions from "firebase-functions";
import * as dotenv from "dotenv";
import authRoutes from "./routes/AuthRoutes";
import courseRoutes from "./routes/CourseRoutes";
import labRoutes from "./routes/LabRoutes";
import registrableCourseRoutes from "./routes/RegistrableCourseRoutes";
import registrationRoutes from "./routes/RegistrationRoutes";
import scheduleRoutes from "./routes/ScheduleRoutes";
import semesterRoutes from "./routes/SemesterRoutes";
import teachingRoutes from "./routes/TeachingRoutes";
import userRoutes from "./routes/UserRoutes";
import requestRoutes from "./routes/RequestRoutes";
import commentRoutes from "./routes/CommentRoutes";
import academicYearRoutes from "./routes/AcademicYearRoutes";

const app: Application = express();
dotenv.config();
app.use(cors());
const API_URL = process.env.API_URL;
connect(process.env.CONNECTION_STRING!.toString());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("Method=:method |URL= :url |Status= :status | :response-time ms\n")
);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PUT, DELETE, PATCH, GET"
    );
    return res.status(200).json({});
  }
  next();
});

app.get(`${API_URL}`, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Lab Management version 2",
  });
});
app.use(`${API_URL}/auth`, authRoutes);
app.use(`${API_URL}/courses`, courseRoutes);
app.use(`${API_URL}/labs`, labRoutes);
app.use(`${API_URL}/registrable-courses`, registrableCourseRoutes);
app.use(`${API_URL}/registrations`, registrationRoutes);
app.use(`${API_URL}/schedules`, scheduleRoutes);
app.use(`${API_URL}/semesters`, semesterRoutes);
app.use(`${API_URL}/teachings`, teachingRoutes);
app.use(`${API_URL}/users`, userRoutes);
app.use(`${API_URL}/requests`, requestRoutes);
app.use(`${API_URL}/comments`, commentRoutes);
app.use(`${API_URL}/academic-years`, academicYearRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: NodeJS.ErrnoException = new Error("Page Not Found!");
  error.code = "404";
  next(error);
});

app.use(
  (
    error: NodeJS.ErrnoException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.status(Number(error.code) || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  }
);

exports.app = functions.https.onRequest(app);
