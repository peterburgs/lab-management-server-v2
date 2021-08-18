import mongoose from "mongoose";
import log from "../util/log";
import {STATUSES} from "../common/statuses";

export default (connectionString: string) => {
    const connect = () => {
        mongoose
            .connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: "lab-management",
                useFindAndModify: false,
                useCreateIndex: true,
            })
    };
    connect();
    mongoose.connection.on("disconnected", connect);
    mongoose.connection.on("error", () => connect());
};
