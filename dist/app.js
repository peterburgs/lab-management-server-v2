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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_1 = __importDefault(require("./connect"));
const log_1 = __importDefault(require("./util/log"));
const statuses_1 = require("./common/statuses");
const morgan_1 = __importDefault(require("morgan"));
log_1.default(statuses_1.STATUSES.INFO, "Initializing server");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const SemesterRoutes_1 = __importDefault(require("./routes/SemesterRoutes"));
const RegistrableCourseRoutes_1 = __importDefault(require("./routes/RegistrableCourseRoutes"));
const port = 3001;
const app = express_1.default();
const API_URL = process.env.API_URL;
connect_1.default(process.env.CONNECTION_STRING.toString());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(morgan_1.default("Method=:method |URL= :url |Status= :status | :response-time ms"));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PUT, DELETE, PATCH, GET");
        return res.status(200).json({});
    }
    next();
});
app.get(`${API_URL}`, (req, res) => {
    res.status(200).json({
        message: "Welcome to Lab Management version 2",
    });
});
app.use(`${API_URL}/users`, UserRoutes_1.default);
app.use(`${API_URL}/auth`, AuthRoutes_1.default);
app.use(`${API_URL}/semesters`, SemesterRoutes_1.default);
app.use(`${API_URL}/registrable-courses`, RegistrableCourseRoutes_1.default);
app.use((req, res, next) => {
    const error = new Error("Page Not Found!");
    error.code = "404";
    next(error);
});
app.use((error, req, res, next) => {
    res.status(Number(error.code) || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
app.listen(port, () => log_1.default(statuses_1.STATUSES.SUCCESS, `Server is running on port ${port}`));
