import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import assert from "assert";
import bpu from "../../src/browser";
import raws from "../raw.json";
const largeraw = raws[0];
describe("BPU", function () {
    beforeEach(() => {
        jest.resetModules();
    });
    test("test require main", async () => {
        const { mocked } = jest.mock("../../dist/bpu.js", () => require("../../dist/bmap.js"));
        mocked((bpujs) => {
            expect(typeof bpujs).toBe("object");
            expect(typeof bpujs.parse).toBe("object");
        });
    });
    test("test require module", async () => {
        const { mocked } = jest.mock("../../dist/bpu.module.js", () => require("../../dist/bmap.module.js"));
        mocked((bpujs) => {
            expect(typeof bpujs).toBe("object");
            expect(typeof bpujs.parse).toBe("object");
        });
    });
    describe("transform", function () {
        test("larger than 512 bytes => ls", async function () {
            let result = await bpu.parse({
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
            assert.deepEqual(["ii", "i", "ls", "lb"], keys);
        });
    });
});