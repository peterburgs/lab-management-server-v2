// Import libraries
import express, { Request, Response, NextFunction, Application } from "express";
import connect from "./connect";
import log from "./util/log";
import { STATUSES } from "./common/statuses";
import morgan from "morgan";
import cors from "cors";

// Notify
log(STATUSES.INFO, "Initializing server");
// Env
import * as dotenv from "dotenv";
dotenv.config();

// Import Routes
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
import systemlogRoutes from "./routes/SystemlogRoutes";

// Config app
const port = 3001;
const app: Application = express();
const API_URL = process.env.API_URL;

// Connect to DB
connect(process.env.CONNECTION_STRING!.toString());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("Method=:method |URL= :url |Status= :status | :response-time ms\n")
);

// Prevent CORS errors
app.use(cors());
// Handle header
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
// Define URL

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
app.use(`${API_URL}/systemlogs`, systemlogRoutes);

// Handle 404 error
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: NodeJS.ErrnoException = new Error("Page Not Found!");
  error.code = "404";
  next(error);
});

// Handle other error codes
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

app.listen(port, () =>
  log(STATUSES.SUCCESS, `Server is running on port ${port}`)
);
