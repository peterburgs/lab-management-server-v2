import { STATUSES } from "../common/statuses";
export default (status: STATUSES, message: string | object) => {
  let barack = "";
  if (typeof message == "string") {
    for (let i = 0; i < message.length / 2; i++) {
      barack += "🌸";
    }
  } else barack = "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸";
  if (typeof message == "string") {
    console.log(barack);
    console.log(`🐝 ${status} 🐝\n`);
    console.log(message);
    console.log(barack);
    console.log("\n");
  } else {
    console.log(barack);
    console.log(`🐝 ${status} 🐝\n`);
    console.log(message);
    console.log(barack);
    console.log("\n");
  }
};
export function message(status: STATUSES, message: string) {
  return `🔥${status}: ${message}🔥`;
}
