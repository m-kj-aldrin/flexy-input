import { InputOption, InputRange, InputSelect } from "./app";

declare global {
    interface HTMLElementTagNameMap {
        "input-range": InputRange;
        "input-select": InputSelect;
        "input-opt": InputOption;
    }
    interface HTMLElementEventMap {}
}
