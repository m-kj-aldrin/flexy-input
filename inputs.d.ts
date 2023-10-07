import { InputOption, InputRange, InputSelect, InputSwitch } from "./app";

declare global {
    interface HTMLElementTagNameMap {
        "input-range": InputRange;
        "input-select": InputSelect;
        "input-opt": InputOption;
        "input-switch": InputSwitch;
    }
    interface HTMLElementEventMap {}
}
