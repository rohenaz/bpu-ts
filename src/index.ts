import { Address, OpCode, Tx, TxIn, TxOut } from "@ts-bitcoin/core";
import RpcClient, { Config } from "bitcoind-rpc";

const fromHash = function (o: ParseConfig, config?: Config): Promise<BpuTx> {
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
    if ((o.tx as ByTxId)?.h) {
      rpc.getRawTransaction(
        (o.tx as ByTxId).h,
        async function (err, transaction) {
          if (err) {
            reject(err);
          } else {
            if (o.tx) {
              (o.tx as ByRawTx).r = transaction.result;
              const result = await fromTx(o);
              resolve(result);
            } else {
              reject(new Error(`Failed to get raw tx from RPC endpoint`));
            }
          }
        }
      );
    }
  });
};

type Cell = {
  op?: number;
  ops?: string;
  b?: string;
  s?: string;
  ii: number;
  i: number;
  h?: string;
  f?: string;
  ls?: string;
  lh?: string;
  lf?: string;
  lb?: string;
};

type Tape = {
  cell: Cell[];
  i: number;
};

type Out = {
  tape: Tape[];
  i: number;
  e: {
    i: number;
    a: string | false;
    v: number;
  };
};

type In = {
  i: number;
  e: {
    h: string;
    a: string;
    v?: number;
  };
};

export type BpuTx = {
  out: Out[];
  in?: In[];
  tx: {
    h?: string;
    r?: string;
  };
  lock?: number;
};

const fromTx = function (o: ParseConfig): Promise<BpuTx> {
  const transaction = (o.tx as ByRawTx).r;
  return new Promise(function (resolve, reject) {
    if (transaction) {
      const gene = Tx.fromHex(transaction);
      const inputs = gene.txIns ? collect(o, "in", gene.txIns) : [];
      const outputs = gene.txOuts ? collect(o, "out", gene.txOuts) : [];
      resolve({
        tx: { h: gene.hash().toString() },
        in: inputs as In[],
        out: outputs as Out[],
        lock: gene.nLockTime,
      });
    } else {
      reject(new Error(`No transaction`));
    }
  });
};

const collect = function (
  o: ParseConfig,
  type: any,
  xputs: (TxIn | TxOut)[]
): In[] | Out[] {
  const xputsres: any = [];
  if (!o.transform)
    o.transform = function (r: any) {
      return r;
    };
  xputs.forEach(function (xput, xput_index) {
    if (xput.script) {
      const xputres = { i: xput_index, tape: [] } as any;
      let tape_i = 0;
      let cell_i = 0;
      let cell: any = [];
      xput.script.chunks.forEach(function (c, chunk_index) {
        if (c.buf) {
          const b = c.buf.toString("base64");
          const s = c.buf.toString("utf8");
          let splitter: string | undefined;
          let isSplitter = false;
          if (o.split && Array.isArray(o.split)) {
            o.split.forEach(function (setting: any) {
              if (
                (setting.token && setting.token.s && setting.token.s === s) ||
                (setting.token && setting.token.b && setting.token.b === b)
              ) {
                splitter = setting.include;
                isSplitter = true;
              }
            });
          }
          if (isSplitter && o.transform) {
            if (splitter === "l") {
              const item = o.transform(
                {
                  b: c.buf.toString("base64"),
                  s: c.buf.toString("utf8"),
                  ii: chunk_index,
                  i: cell_i++,
                },
                c
              );

              cell.push(item);
              xputres.tape.push({ cell: cell, i: tape_i++ });
              cell = [];
              cell_i = 0;
            } else if (splitter === "r") {
              xputres.tape.push({ cell: cell, i: tape_i++ });
              const item = o.transform(
                {
                  b: c.buf.toString("base64"),
                  s: c.buf.toString("utf8"),
                  ii: chunk_index,
                  i: cell_i++,
                },
                c
              );
              cell = [item];
              cell_i = 1;
            } else if (splitter === "c") {
              xputres.tape.push({ cell: cell, i: tape_i++ });
              const item = o.transform(
                {
                  b: c.buf.toString("base64"),
                  s: c.buf.toString("utf8"),
                  ii: chunk_index,
                  i: 0,
                },
                c
              );
              xputres.tape.push({ cell: [item], i: tape_i++ });
              cell = [];
              cell_i = 0;
            } else {
              xputres.tape.push({ cell: cell, i: tape_i++ });
              cell = [];
              cell_i = 0;
            }
          } else {
            if (o.transform) {
              const item = o.transform(
                {
                  b: c.buf.toString("base64"),
                  s: c.buf.toString("utf8"),
                  ii: chunk_index,
                  i: cell_i++,
                },
                c
              );
              cell.push(item);
            }
          }
        } else {
          // Opcode case
          if (typeof c.opCodeNum !== "undefined") {
            const op = c.opCodeNum;
            const ops = OpCode[op].toString();
            let splitter: string | undefined;
            let isSplitter = false;
            if (o.split && Array.isArray(o.split)) {
              o.split.forEach(function (setting: any) {
                if (
                  (setting.token &&
                    setting.token.op &&
                    setting.token.op === op) ||
                  (setting.token &&
                    setting.token.ops &&
                    setting.token.ops === ops)
                ) {
                  splitter = setting.include;
                  isSplitter = true;
                }
              });
            }
            if (isSplitter && o.transform) {
              if (splitter === "l") {
                const item = o.transform(
                  { op: op, ops: ops, ii: chunk_index, i: cell_i++ },
                  c
                );
                cell.push(item);
                xputres.tape.push({ cell: cell, i: tape_i++ });
                cell = [];
                cell_i = 0;
              } else if (splitter === "r") {
                xputres.tape.push({ cell: cell, i: tape_i++ });
                const item = o.transform(
                  { op: op, ops: ops, ii: chunk_index, i: cell_i++ },
                  c
                );
                cell = [item];
                cell_i = 1;
              } else if (splitter === "c") {
                xputres.tape.push({ cell: cell, i: tape_i++ });
                const item = o.transform(
                  { op: op, ops: ops, ii: chunk_index, i: cell_i++ },
                  c
                );
                xputres.tape.push({ cell: [item], i: tape_i++ });
                cell = [];
                cell_i = 0;
              } else {
                xputres.tape.push({ cell: cell, i: tape_i++ });
                cell = [];
                cell_i = 0;
              }
            } else {
              if (o.transform) {
                const item = o.transform(
                  { op: op, ops: ops, ii: chunk_index, i: cell_i++ },
                  c
                );
                cell.push(item);
              }
            }
          } else {
            if (o.transform) {
              cell.push(
                o.transform({ op: c, ii: chunk_index, i: cell_i++ }, c)
              );
            }
          }
        }
      });

      if (cell.length > 0) xputres.tape.push({ cell: cell, i: tape_i++ });
      if (type === "in") {
        const sender = {
          h: (xput as TxIn).txHashBuf?.toString("hex"),
          i: xput.scriptVi,
        } as any;
        const address = Address.fromTxInScript(xput.script).toString();
        if (address && address.length > 0) {
          sender.a = address;
        }
        xputres.e = sender;
        xputres.seq = (xput as TxIn).nSequence;
      } else if (type === "out") {
        const receiver = { v: (xput as TxOut).valueBn, i: xput_index } as any;
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

type ByRawTx = {
  r: string;
};

type ByTxId = {
  h: string;
};

type SplitConfig = {
  token: {
    op?: number;
    ops?: string;
    s?: string;
    b?: string;
  };
  include?: string;
};

export type ParseConfig = {
  tx: ByRawTx | ByTxId;
  split?: SplitConfig[];
  transform?: (o: any, c: any) => Object;
};

export const parse = (o: ParseConfig, config?: any): Promise<BpuTx> => {
  if (o.tx) {
    if ((o.tx as ByTxId).h) {
      return fromHash(o, config);
    } else if ((o.tx as ByRawTx).r) {
      return fromTx(o);
    }
  }
  throw new Error(`Invalid Tx`);
};

export type { Config } from "bitcoind-rpc";
