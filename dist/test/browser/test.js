"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const assert_1 = __importDefault(require("assert"));
const browser_1 = __importDefault(require("../../src/browser"));
const raw_json_1 = __importDefault(require("../raw.json"));
const largeraw = raw_json_1.default[0];
(0, globals_1.describe)("BPU", function () {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.resetModules();
    });
    (0, globals_1.test)("test require main", async () => {
        const { mocked } = globals_1.jest.mock("../../dist/bpu.js", () => require("../../dist/bmap.js"));
        mocked((bpujs) => {
            (0, globals_1.expect)(typeof bpujs).toBe("object");
            (0, globals_1.expect)(typeof bpujs.parse).toBe("object");
        });
    });
    (0, globals_1.test)("test require module", async () => {
        const { mocked } = globals_1.jest.mock("../../dist/bpu.module.js", () => require("../../dist/bmap.module.js"));
        mocked((bpujs) => {
            (0, globals_1.expect)(typeof bpujs).toBe("object");
            (0, globals_1.expect)(typeof bpujs.parse).toBe("object");
        });
    });
    (0, globals_1.describe)("transform", function () {
        (0, globals_1.test)("larger than 512 bytes => ls", async function () {
            let result = await browser_1.default.parse({
                tx: { r: largeraw },
                split: [
                    {
                        token: { s: "|" },
                    },
                ],
                transform: function (o, c) {
                    if (c.buf && c.buf.byteLength > 512) {
                        o["ls"] = o.s;
                        o["lb"] = o.b;
                        delete o.s;
                        delete o.b;
                    }
                    return o;
                },
            });
            let tape = result.out[0].tape[0];
            // console.log(
            //   JSON.stringify(
            //     tape,
            //     function (k, v) {
            //       if (v.length > 512) {
            //         return v.slice(0, 512);
            //       }
            //       return v;
            //     },
            //     2
            //   )
            // );
            let keys = Object.keys(tape.cell[2]);
            // console.log(keys);
            assert_1.default.deepEqual(["ii", "i", "ls", "lb"], keys);
        });
    });
});
