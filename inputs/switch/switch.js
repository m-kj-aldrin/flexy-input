import { Base } from "../base.js";
import switchTemplate from "./switch.component.html?inline"

export class InputSwitch extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += switchTemplate;

        /**@private */
        this._value = null;

        this.onpointerup = (e) => {
            this.toggleAttribute("open");
            this.value = this.hasAttribute("open");
            this.dispatchEvent(new Event("change", { bubbles: true }));
        };
    }

    /**@param {boolean} v */
    set value(v) {
        this._value = v;
    }

    get value() {
        return this._value;
    }

    get normValue() {
        return this._value;
    }

    set normValue(v) {
        this.value = v;
    }
}
