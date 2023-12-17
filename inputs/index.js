import { InputButton } from "./button/button.js";
import { InputNumber } from "./number/number.js";
import { InputPicker } from "./picker/picker.js";
import { InputRange } from "./range/range.js";
import { InputOption, InputSelect } from "./select/select.js";
import { SlideParent } from "./slide-parent/slide-parent.js";
import { InputSwitch } from "./switch/switch.js";

/**
 *
 * @param {Event} e
 * @param {string} type
 * @param {{}} detail
 */
window.$E = function (e, type, detail = {}) {
    e.currentTarget.dispatchEvent(
        new CustomEvent(type, {
            bubbles: true,
            detail: {
                ...detail,
                target: e.target,
            },
        })
    );
};

customElements.define("input-range", InputRange);
customElements.define("input-select", InputSelect);
customElements.define("input-opt", InputOption);
customElements.define("input-switch", InputSwitch);
customElements.define("input-picker", InputPicker);
customElements.define("input-number", InputNumber);
customElements.define("slide-parent", SlideParent);
customElements.define("input-button", InputButton);
