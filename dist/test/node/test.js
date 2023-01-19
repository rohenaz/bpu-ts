"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const assert_1 = __importDefault(require("assert"));
const src_1 = __importDefault(require("../../src"));
const raw_json_1 = __importDefault(require("../raw.json"));
const largeraw = raw_json_1.default[0];
const raw = raw_json_1.default[1];
(0, globals_1.describe)("BPU", function () {
    (0, globals_1.describe)("transform", function () {
        (0, globals_1.test)("larger than 512 bytes => ls", async function () {
            let result = await src_1.default.parse({
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
    (0, globals_1.describe)("split", function () {
        (0, globals_1.test)("no split", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
            });
            assert_1.default.equal(result.out.length, 4);
            result.out.forEach(function (out) {
                assert_1.default.equal(out.tape.length, 1);
            });
        });
        (0, globals_1.test)("split and exclude", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { s: "|" },
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 3);
            assert_1.default.equal(tape[0].cell.length, 6);
            assert_1.default.equal(tape[1].cell.length, 18);
            assert_1.default.equal(tape[2].cell.length, 4);
            let pipeExists = false;
            tape.forEach(function (t) {
                t.cell.forEach(function (c) {
                    if (c.s === "|") {
                        pipeExists = true;
                    }
                });
            });
            assert_1.default.equal(pipeExists, false);
        });
        (0, globals_1.test)("split and include left", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { s: "|" },
                        include: "l",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 3);
            assert_1.default.equal(tape[0].cell.length, 7);
            assert_1.default.equal(tape[1].cell.length, 19);
            assert_1.default.equal(tape[2].cell.length, 4);
            assert_1.default.equal(tape[0].cell[tape[0].cell.length - 1].s, "|");
            assert_1.default.equal(tape[1].cell[tape[1].cell.length - 1].s, "|");
            assert_1.default.notEqual(tape[2].cell[tape[2].cell.length - 1].s, "|");
        });
        (0, globals_1.test)("split and include right", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { s: "|" },
                        include: "r",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 3);
            assert_1.default.equal(tape[0].cell.length, 6);
            assert_1.default.equal(tape[1].cell.length, 19);
            assert_1.default.equal(tape[2].cell.length, 5);
            assert_1.default.notEqual(tape[0].cell[0].s, "|");
            assert_1.default.equal(tape[1].cell[0].s, "|");
            assert_1.default.equal(tape[2].cell[0].s, "|");
        });
        (0, globals_1.test)("split and include center", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { s: "|" },
                        include: "c",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 5);
            assert_1.default.equal(tape[0].cell.length, 6);
            assert_1.default.equal(tape[1].cell.length, 1);
            assert_1.default.equal(tape[2].cell.length, 18);
            assert_1.default.equal(tape[3].cell.length, 1);
            assert_1.default.equal(tape[4].cell.length, 4);
            assert_1.default.equal(tape[1].cell[0].s, "|");
            assert_1.default.equal(tape[3].cell[0].s, "|");
        });
        (0, globals_1.test)("split with op", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { op: 106 },
                        include: "l",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 2);
            assert_1.default.equal(tape[0].cell.length, 1);
            assert_1.default.equal(tape[1].cell.length, 29);
            assert_1.default.equal(tape[0].cell[0].op, 106);
            assert_1.default.equal(tape[0].cell.length, 1);
        });
        (0, globals_1.test)("split with ops", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { ops: "OP_RETURN" },
                        include: "l",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            assert_1.default.equal(tape.length, 2);
            assert_1.default.equal(tape[0].cell.length, 1);
            assert_1.default.equal(tape[1].cell.length, 29);
            assert_1.default.equal(tape[0].cell[0].op, 106);
            assert_1.default.equal(tape[0].cell.length, 1);
        });
        (0, globals_1.test)("split multiple tokens", async function () {
            let result = await src_1.default.parse({
                tx: { r: raw },
                split: [
                    {
                        token: { s: "|" },
                        include: "c",
                    },
                    {
                        token: { op: 106 },
                        include: "l",
                    },
                ],
            });
            assert_1.default.equal(result.out.length, 4);
            let tape = result.out[0].tape;
            // console.log(JSON.stringify(tape, null, 2));
            // console.log(JSON.stringify(result, null, 2));
            assert_1.default.equal(tape.length, 6);
            assert_1.default.equal(tape[0].cell.length, 1);
            assert_1.default.equal(tape[1].cell.length, 5);
            assert_1.default.equal(tape[2].cell.length, 1);
            assert_1.default.equal(tape[3].cell.length, 18);
            assert_1.default.equal(tape[4].cell.length, 1);
            assert_1.default.equal(tape[5].cell.length, 4);
            assert_1.default.equal(tape[0].cell[0].op, 106);
            assert_1.default.equal(tape[0].cell.length, 1);
            assert_1.default.equal(tape[2].cell[0].s, "|");
            assert_1.default.equal(tape[2].cell.length, 1);
            assert_1.default.equal(tape[4].cell[0].s, "|");
            assert_1.default.equal(tape[4].cell.length, 1);
        });
    });
});
