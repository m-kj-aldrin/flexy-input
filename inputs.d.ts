import { InputRange } from "./app";

declare global {
    interface HTMLElementTagNameMap {
        "input-range": InputRange;
    }
    interface HTMLElementEventMap {}
}
