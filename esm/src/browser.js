import { Buffer } from "buffer";
import { parse } from "./";
const bpu = {
    parse,
};
if (typeof window !== "undefined") {
    window.bpu = bpu;
    if (!window.Buffer) {
        window.Buffer = Buffer;
    }
}
export default bpu;
