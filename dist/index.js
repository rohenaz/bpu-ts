import { Address, OpCode, Tx } from "@ts-bitcoin/core";
import RpcClient from "bitcoind-rpc";
const fromHash = function (o, config) {
    if (!config) {
        console.log("split from hash without config");
        config = {
            protocol: "http",
            user: process.env.BITCOIN_USERNAME
                ? process.env.BITCOIN_USERNAME
                : "root",
            pass: process.env.BITCOIN_PASSWORD
                ? process.env.BITCOIN_PASSWORD
                : "bitcoin",
            host: process.env.BITCOIN_IP ? process.env.BITCOIN_IP : "127.0.0.1",
            port: process.env.BITCOIN_PORT ? process.env.BITCOIN_PORT : "8332",
        };
    }
    const rpc = new RpcClient(config);
    return new Promise(function (resolve, reject) {
        if (o.tx?.h) {
            rpc.getRawTransaction(o.tx.h, async function (err, transaction) {
                if (err) {
                    reject(err);
                }
                else {
                    if (o.tx) {
                        o.tx.r = transaction.result;
                        const result = await fromTx(o);
                        resolve(result);
                    }
                    else {
                        reject(new Error(`Failed to get raw tx from RPC endpoint`));
                    }
                }
            });
        }
    });
};
const fromTx = function (o) {
    const transaction = o.tx.r;
    return new Promise(function (resolve, reject) {
        if (transaction) {
            const gene = Tx.fromHex(transaction);
            const inputs = gene.txIns ? collect(o, "in", gene.txIns) : [];
            const outputs = gene.txOuts ? collect(o, "out", gene.txOuts) : [];
            resolve({
                tx: { h: gene.hash().toString() },
                in: inputs,
                out: outputs,
                lock: gene.nLockTime,
            });
        }
        else {
            reject(new Error(`No transaction`));
        }
    });
};
const collect = function (o, type, xputs) {
    const xputsres = [];
    if (!o.transform)
        o.transform = function (r) {
            return r;
        };
    xputs.forEach(function (xput, xput_index) {
        if (xput.script) {
            const xputres = { i: xput_index, tape: [] };
            let tape_i = 0;
            let cell_i = 0;
            let cell = [];
            xput.script.chunks.forEach(function (c, chunk_index) {
                if (c.buf) {
                    const b = c.buf.toString("base64");
                    const s = c.buf.toString("utf8");
                    let splitter;
                    let isSplitter = false;
                    if (o.split && Array.isArray(o.split)) {
                        o.split.forEach(function (setting) {
                            if ((setting.token && setting.token.s && setting.token.s === s) ||
                                (setting.token && setting.token.b && setting.token.b === b)) {
                                splitter = setting.include;
                                isSplitter = true;
                            }
                        });
                    }
                    if (isSplitter && o.transform) {
                        if (splitter === "l") {
                            const item = o.transform({
                                b: c.buf.toString("base64"),
                                s: c.buf.toString("utf8"),
                                ii: chunk_index,
                                i: cell_i++,
                            }, c);
                            cell.push(item);
                            xputres.tape.push({ cell: cell, i: tape_i++ });
                            cell = [];
                            cell_i = 0;
                        }
                        else if (splitter === "r") {
                            xputres.tape.push({ cell: cell, i: tape_i++ });
                            const item = o.transform({
                                b: c.buf.toString("base64"),
                                s: c.buf.toString("utf8"),
                                ii: chunk_index,
                                i: cell_i++,
                            }, c);
                            cell = [item];
                            cell_i = 1;
                        }
                        else if (splitter === "c") {
                            xputres.tape.push({ cell: cell, i: tape_i++ });
                            const item = o.transform({
                                b: c.buf.toString("base64"),
                                s: c.buf.toString("utf8"),
                                ii: chunk_index,
                                i: 0,
                            }, c);
                            xputres.tape.push({ cell: [item], i: tape_i++ });
                            cell = [];
                            cell_i = 0;
                        }
                        else {
                            xputres.tape.push({ cell: cell, i: tape_i++ });
                            cell = [];
                            cell_i = 0;
                        }
                    }
                    else {
                        if (o.transform) {
                            const item = o.transform({
                                b: c.buf.toString("base64"),
                                s: c.buf.toString("utf8"),
                                ii: chunk_index,
                                i: cell_i++,
                            }, c);
                            cell.push(item);
                        }
                    }
                }
                else {
                    // Opcode case
                    if (typeof c.opCodeNum !== "undefined") {
                        const op = c.opCodeNum;
                        const ops = OpCode[op].toString();
                        let splitter;
                        let isSplitter = false;
                        if (o.split && Array.isArray(o.split)) {
                            o.split.forEach(function (setting) {
                                if ((setting.token &&
                                    setting.token.op &&
                                    setting.token.op === op) ||
                                    (setting.token &&
                                        setting.token.ops &&
                                        setting.token.ops === ops)) {
                                    splitter = setting.include;
                                    isSplitter = true;
                                }
                            });
                        }
                        if (isSplitter && o.transform) {
                            if (splitter === "l") {
                                const item = o.transform({ op: op, ops: ops, ii: chunk_index, i: cell_i++ }, c);
                                cell.push(item);
                                xputres.tape.push({ cell: cell, i: tape_i++ });
                                cell = [];
                                cell_i = 0;
                            }
                            else if (splitter === "r") {
                                xputres.tape.push({ cell: cell, i: tape_i++ });
                                const item = o.transform({ op: op, ops: ops, ii: chunk_index, i: cell_i++ }, c);
                                cell = [item];
                                cell_i = 1;
                            }
                            else if (splitter === "c") {
                                xputres.tape.push({ cell: cell, i: tape_i++ });
                                const item = o.transform({ op: op, ops: ops, ii: chunk_index, i: cell_i++ }, c);
                                xputres.tape.push({ cell: [item], i: tape_i++ });
                                cell = [];
                                cell_i = 0;
                            }
                            else {
                                xputres.tape.push({ cell: cell, i: tape_i++ });
                                cell = [];
                                cell_i = 0;
                            }
                        }
                        else {
                            if (o.transform) {
                                const item = o.transform({ op: op, ops: ops, ii: chunk_index, i: cell_i++ }, c);
                                cell.push(item);
                            }
                        }
                    }
                    else {
                        if (o.transform) {
                            cell.push(o.transform({ op: c, ii: chunk_index, i: cell_i++ }, c));
                        }
                    }
                }
            });
            if (cell.length > 0)
                xputres.tape.push({ cell: cell, i: tape_i++ });
            if (type === "in") {
                const sender = {
                    h: xput.txHashBuf?.toString("hex"),
                    i: xput.scriptVi,
                };
                const address = Address.fromTxInScript(xput.script).toString();
                if (address && address.length > 0) {
                    sender.a = address;
                }
                xputres.e = sender;
                xputres.seq = xput.nSequence;
            }
            else if (type === "out") {
                const receiver = { v: xput.valueBn, i: xput_index };
                const address = Address.fromTxOutScript(xput.script).toString();
                if (address && address.length > 0) {
                    receiver.a = address;
                }
                xputres.e = receiver;
            }
            xputsres.push(xputres);
        }
    });
    return xputsres;
};
export const parse = (o, config) => {
    if (o.tx) {
        if (o.tx.h) {
            return fromHash(o, config);
        }
        else if (o.tx.r) {
            return fromTx(o);
        }
    }
    throw new Error(`Invalid Tx`);
};
