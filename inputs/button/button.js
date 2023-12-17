import { Base } from "../base.js";
import buttonTemplate from "./button.component.html?inline";

export class InputButton extends Base {
    #_init = false;
    #_value = false;

    constructor() {
        super();

        this.shadowRoot.innerHTML += buttonTemplate;

        this.onclick = (e) => {
            if (this.isToggling) {
                this.value = !this.value;
                this.shadowRoot
                    .querySelector("button")
                    .toggleAttribute("active", this.value);
            } else {
                this.#_value = true;
            }

            this.dispatchEvent(new InputEvent("change", { bubbles: true }));
        };
    }

    connectedCallback() {
        if (!this.#_init) {
            this.#_init = true;
            if (this.isToggling) {
                this.#_value =
                    this.getAttribute("toggle") == "true" ? true : false;
                this.shadowRoot
                    .querySelector("button")
                    .toggleAttribute("active", this.value);
            }
        }
    }

    get isToggling() {
        return this.hasAttribute("toggle");
    }

    get normValue() {
        return this.#_value;
    }

    /**@param {any} v */
    set value(v) {
        this.#_value = v;
    }

    set normValue(v) {
        this.value = v;
    }

    get value() {
        return this.#_value;
    }
}
