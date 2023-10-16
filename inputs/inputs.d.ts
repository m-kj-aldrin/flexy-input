import { InputButton } from "./button";
import { InputNumber } from "./number";
import { InputPicker } from "./picker";
import { InputRange } from "./range";
import { InputOption, InputSelect } from "./select";
import { SlideParent } from "./slide-parent";
import { InputSwitch } from "./switch";

declare global {
    interface HTMLElementTagNameMap {
        "input-range": InputRange;
        "input-select": InputSelect;
        "input-opt": InputOption;
        "input-switch": InputSwitch;
        "input-picker": InputPicker;
        "input-number": InputNumber;
        "slide-parent": SlideParent;
        "input-button": InputButton;
    }
    interface HTMLElementEventMap {}
}
