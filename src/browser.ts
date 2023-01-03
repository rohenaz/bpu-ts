import { Buffer } from "buffer";
import crypto from "crypto";
import { BPU, parse } from ".";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    bpu: BPU;
    crypto: typeof crypto;
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
