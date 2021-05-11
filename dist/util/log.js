"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = void 0;
exports.default = (status, message) => {
    let barack = "";
    for (let i = 0; i < message.length + status.length + 6; i++) {
        barack += "=";
    }
    console.log(`${barack}\n🔥${status}: ${message}🔥\n${barack}`);
};
function message(status, message) {
    return `🔥${status}: ${message}🔥`;
}
exports.message = message;
