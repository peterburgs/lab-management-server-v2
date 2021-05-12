"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = void 0;
exports.default = (status, message) => {
    let barack = "";
    if (typeof message == "string") {
        for (let i = 0; i < message.length / 2; i++) {
            barack += "🌸";
        }
    }
    else
        barack = "🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸🌸";
    if (typeof message == "string") {
        console.log(barack);
        console.log(`🐝 ${status} 🐝\n`);
        console.log(message);
        console.log(barack);
        console.log("\n");
    }
    else {
        console.log(barack);
        console.log(`🐝 ${status} 🐝\n`);
        console.log(message);
        console.log(barack);
        console.log("\n");
    }
};
function message(status, message) {
    return `🔥${status}: ${message}🔥`;
}
exports.message = message;
