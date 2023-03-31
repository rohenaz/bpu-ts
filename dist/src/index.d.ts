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
export declare const parse: (o: ParseConfig, config?: any) => Promise<BpuTx>;
export type { Config } from "bitcoind-rpc";
//# sourceMappingURL=index.d.ts.map