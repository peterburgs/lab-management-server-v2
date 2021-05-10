import mongoose from "mongoose";
import log from "../util/log";
import { STATUSES } from "../common/statuses";
export default (connectionString: string) => {
  const connect = () => {
    mongoose
      .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "lab-management",
      })
      .then(() => log(STATUSES.SUCCESS, "Connected to MongoDB"))
      .catch((err) => log(STATUSES.ERROR, err.message));
  };
  connect();
  mongoose.connection.on("disconnected", connect);
  mongoose.connection.on("error", () =>
    log(STATUSES.ERROR, "Fail to connect to MongoDB!")
  );
};
