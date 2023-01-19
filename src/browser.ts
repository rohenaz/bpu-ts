import { Buffer } from "buffer";
import { parse } from "./";
// export { parse } from "./";

type BPU = {
  parse: typeof parse;
};

declare global {
  interface Window {
    bpu: BPU;
  }
}

const bpu = {
  parse,
} as BPU;

if (typeof window !== "undefined") {
  window.bpu = bpu;

  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
}

export default bpu;
