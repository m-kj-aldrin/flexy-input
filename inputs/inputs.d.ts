import { InputButton } from "./button/button";
import { InputNumber } from "./number/number";
import { InputPicker } from "./picker/picker";
import { InputRange } from "./range/range";
import { InputOption, InputSelect } from "./select/select";
import { SlideParent } from "./slide-parent/slide-parent";
import { InputSwitch } from "./switch/switch";

declare global {
    interface Window {
        $E: (e: Event, type: string, detail?: {}) => void;
    }
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
