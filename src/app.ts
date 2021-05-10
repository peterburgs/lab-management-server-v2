// Import libraries
import express, { Request, Response, NextFunction, Application } from "express";
import connect from "./connect";
import log from "./util/log";
import { STATUSES } from "./common/statuses";
import morgan from "morgan";
// Notify
log(STATUSES.INFO, "Initializing server");
// Env
import * as dotenv from "dotenv";
dotenv.config();

// Import Models
import "./models/Course";

// Import Routes
import userRoutes from "./routes/UserRoutes";

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
  morgan("Method=:method |URL= :url |Status= :status | :response-time ms")
);

// Prevent CORS errors
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
app.use(`${API_URL}/users`, userRoutes);
app.get(`${API_URL}`, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Lab Management version 2",
  });
});

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
