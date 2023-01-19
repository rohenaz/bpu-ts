import { parse } from "./";
type BPU = {
    parse: typeof parse;
};
declare global {
    interface Window {
        bpu: BPU;
    }
}
declare const bpu: BPU;
export default bpu;
//# sourceMappingURL=browser.d.ts.map