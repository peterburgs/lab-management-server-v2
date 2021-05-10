"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const log_1 = __importDefault(require("../util/log"));
const statuses_1 = require("../common/statuses");
exports.default = (connectionString) => {
    const connect = () => {
        mongoose_1.default
            .connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "lab-management",
        })
            .then(() => log_1.default(statuses_1.STATUSES.SUCCESS, "Connected to MongoDB"))
            .catch((err) => log_1.default(statuses_1.STATUSES.ERROR, err.message));
    };
    connect();
    mongoose_1.default.connection.on("disconnected", connect);
    mongoose_1.default.connection.on("error", () => log_1.default(statuses_1.STATUSES.ERROR, "Fail to connect to MongoDB!"));
};
