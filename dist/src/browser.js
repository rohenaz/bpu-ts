"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
const _1 = require("./");
const bpu = {
    parse: _1.parse,
};
if (typeof window !== "undefined") {
    window.bpu = bpu;
    if (!window.Buffer) {
        window.Buffer = buffer_1.Buffer;
    }
}
exports.default = bpu;
