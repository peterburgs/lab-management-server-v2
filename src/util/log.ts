import { STATUSES } from "../common/statuses";
export default (status: STATUSES, message: string) => {
  let barack = "";
  for (let i = 0; i < message.length + status.length + 6; i++) {
    barack += "=";
  }
  console.log(`${barack}\n🔥${status}: ${message}🔥\n${barack}`);
};
