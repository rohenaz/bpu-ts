import { describe, test } from "@jest/globals";
import assert from "assert";

import { parse } from "../../src";
import raws from "../raw.json";

const largeraw = raws[0];
const raw = raws[1];
const ordRaw = raws[2];
describe("BPU", function () {
  describe("transform", function () {
    test("larger than 512 bytes => ls", async function () {
      let result = await parse({
        tx: { r: largeraw },
        split: [
          {
            token: { s: "|" },
          },
        ],
        transform: function (o: any, c: any) {
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
  describe("txid", function () {
    test("has ord txid", async function () {
      let result = await parse({
        tx: { r: ordRaw },
        split: [
          { token: { ops: "OP_RETURN" } },
          {
            token: { s: "|" },
          },
        ],
        transform: function (o: any, c: any) {
          if (c.buf && c.buf.byteLength > 512) {
            o["ls"] = o.s;
            o["lb"] = o.b;
            delete o.s;
            delete o.b;
          }
          return o;
        },
      });
      assert.equal(
        result.tx.h,
        "10f4465cd18c39fbc7aa4089268e57fc719bf19c8c24f2e09156f4a89a2809d6"
      );
      assert.equal(result.out[0].tape.length, 2);

      //let tape = result.out[0].tape[0];
    });
  });
  describe("split", function () {
    test("no split", async function () {
      let result = await parse({
        tx: { r: raw },
      });
      assert.equal(result.out.length, 4);
      result.out.forEach(function (out) {
        assert.equal(out.tape.length, 1);
      });
    });
    test("split and exclude", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { s: "|" },
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 3);
      assert.equal(tape[0].cell.length, 6);
      assert.equal(tape[1].cell.length, 18);
      assert.equal(tape[2].cell.length, 4);
      let pipeExists = false;
      tape.forEach(function (t) {
        t.cell.forEach(function (c) {
          if (c.s === "|") {
            pipeExists = true;
          }
        });
      });
      assert.equal(pipeExists, false);
    });
    test("split and include left", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { s: "|" },
            include: "l",
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 3);
      assert.equal(tape[0].cell.length, 7);
      assert.equal(tape[1].cell.length, 19);
      assert.equal(tape[2].cell.length, 4);
      assert.equal(tape[0].cell[tape[0].cell.length - 1].s, "|");
      assert.equal(tape[1].cell[tape[1].cell.length - 1].s, "|");
      assert.notEqual(tape[2].cell[tape[2].cell.length - 1].s, "|");
    });
    test("split and include right", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { s: "|" },
            include: "r",
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 3);
      assert.equal(tape[0].cell.length, 6);
      assert.equal(tape[1].cell.length, 19);
      assert.equal(tape[2].cell.length, 5);
      assert.notEqual(tape[0].cell[0].s, "|");
      assert.equal(tape[1].cell[0].s, "|");
      assert.equal(tape[2].cell[0].s, "|");
    });
    test("split and include center", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { s: "|" },
            include: "c",
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 5);
      assert.equal(tape[0].cell.length, 6);
      assert.equal(tape[1].cell.length, 1);
      assert.equal(tape[2].cell.length, 18);
      assert.equal(tape[3].cell.length, 1);
      assert.equal(tape[4].cell.length, 4);
      assert.equal(tape[1].cell[0].s, "|");
      assert.equal(tape[3].cell[0].s, "|");
    });
    test("split with op", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { op: 106 },
            include: "l",
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 2);
      assert.equal(tape[0].cell.length, 1);
      assert.equal(tape[1].cell.length, 29);
      assert.equal(tape[0].cell[0].op, 106);
      assert.equal(tape[0].cell.length, 1);
    });
    test("split with ops", async function () {
      let result = await parse({
        tx: { r: raw },
        split: [
          {
            token: { ops: "OP_RETURN" },
            include: "l",
          },
        ],
      });
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      assert.equal(tape.length, 2);
      assert.equal(tape[0].cell.length, 1);
      assert.equal(tape[1].cell.length, 29);
      assert.equal(tape[0].cell[0].op, 106);
      assert.equal(tape[0].cell.length, 1);
    });
    test("split multiple tokens", async function () {
      let result = await parse({
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
      assert.equal(result.out.length, 4);
      let tape = result.out[0].tape;
      // console.log(JSON.stringify(tape, null, 2));
      // console.log(JSON.stringify(result, null, 2));
      assert.equal(tape.length, 6);
      assert.equal(tape[0].cell.length, 1);
      assert.equal(tape[1].cell.length, 5);
      assert.equal(tape[2].cell.length, 1);
      assert.equal(tape[3].cell.length, 18);
      assert.equal(tape[4].cell.length, 1);
      assert.equal(tape[5].cell.length, 4);
      assert.equal(tape[0].cell[0].op, 106);
      assert.equal(tape[0].cell.length, 1);
      assert.equal(tape[2].cell[0].s, "|");
      assert.equal(tape[2].cell.length, 1);
      assert.equal(tape[4].cell[0].s, "|");
      assert.equal(tape[4].cell.length, 1);
    });
  });
});
