import { Base } from "../base.js";
import selectTemplateStyle from "./select.component.html?inline";
import optTemplate from "./opt.component.html?inline";

// const selectTemplateStyle = `

// `;

/**@type {typeof clickOutsideHandler} */
let boundClickOutsideHandler;

/**
 * @this {InputSelect}
 * @param {PointerEvent & {target:HTMLElement}} e
 */
function clickOutsideHandler(e) {
    if (e.composedPath().some((el) => el == this)) return;
    this.close();
}

export class InputSelect extends Base {
    #_init = false;
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._normValue = null;

        /**@private */
        this._state = false;

        this.shadowRoot.innerHTML += selectTemplateStyle;
        // this.shadowRoot.addEventListener("slotchange", (e) => {
        //     /**@type {InputOption} */
        //     const firstOpt = this.querySelector("input-opt:first-of-type");
        //     const selected = this.shadowRoot.getElementById("selected");
        //     selected.textContent = firstOpt.textContent;
        //     firstOpt.selected = true;
        //     this.value = firstOpt.value;
        // });

        this.addEventListener(
            "option",
            /**@param {InputEvent & {target: InputOption}} e */
            (e) => {
                this.close();

                this._state = false;
                if (this.value == e.target.value) return;

                this.querySelectorAll("input-opt").forEach(
                    (o) => (o.selected = o == e.target)
                );

                this.value = e.target.value;
                this.normValue = e.target.normValue;

                this.shadowRoot.getElementById("selected").textContent =
                    e.target.textContent;

                this.dispatchEvent(new Event("change", { bubbles: true }));
            }
        );

        this.shadowRoot.addEventListener("open", (e) => {
            this._state = !this._state;

            this._state ? this.open() : this.close();
        });
    }

    open() {
        this._state = true;
        /**@type {HTMLElement} */
        const options = this.shadowRoot.querySelector("#options");
        options.style.display = "flex";
        this.toggleAttribute("open", true);

        const box = options.getBoundingClientRect();
        const docHeight = document.documentElement.clientHeight;

        // if (box.y + box.height + 8 > docHeight) {
        //     options.style.bottom = "100%";
        // }

        /**@type {Keyframe[]} */
        let keyFrames = [
            {
                transform: `translateY(${-4}px)`,
            },
            {
                transform: `translateY(0)`,
            },
        ];

        options.animate(keyFrames, {
            fill: "forwards",
            duration: 100,
        }).onfinish = (ae) => {};

        options.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 100,
            fill: "forwards",
        });

        setTimeout(() => {
            window.addEventListener(
                "pointerdown",
                (boundClickOutsideHandler = clickOutsideHandler.bind(this))
            );
        }, 0);
    }

    close() {
        this._state = false;
        /**@type {HTMLElement} */
        const options = this.shadowRoot.querySelector("#options");
        this.removeAttribute("open");

        /**@type {Keyframe[]} */
        let keyFrames = [
            {
                transform: `translateY(${-4}px)`,
            },
            {
                transform: `translateY(0)`,
            },
        ];

        options.animate(keyFrames, {
            fill: "forwards",
            duration: 300,
            direction: "reverse",
        }).onfinish = (ae) => {
            // options.style.removeProperty("bottom");
            options.style.display = "none";
        };

        options.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 100,
            delay: 150,
            fill: "forwards",
            direction: "reverse",
        });

        window.removeEventListener("pointerdown", boundClickOutsideHandler);
    }

    connectedCallback() {
        if (!this.#_init) {
            // setTimeout(() => {
            /**@type {InputOption} */
            const firstOpt = this.querySelector("input-opt:first-of-type");
            const selected = this.shadowRoot.getElementById("selected");
            selected.textContent = firstOpt.textContent;
            firstOpt.selected = true;
            // this.value = firstOpt.value;
            this.value = 0;
            this.normValue = 0;

            // console.log(firstOpt.normValue);
            // }, 0);

            this.#_init = true;
        }
    }

    /**@param {string[]} v */
    set list(v) {
        const optList = v.map((s, i) => {
            const opt = document.createElement("input-opt");
            opt.value = s;
            opt.normValue = i;
            return opt;
        });
        this.querySelectorAll("input-opt").forEach((o) => o.remove());

        this.append(...optList);

        /**@type {InputOption} */
        const firstOpt = this.querySelector("input-opt:first-of-type");
        const selected = this.shadowRoot.getElementById("selected");
        selected.textContent = firstOpt.textContent;
        firstOpt.selected = true;
        this.value = firstOpt.value;
    }

    select(v) {}

    set value(v) {
        this._value = v;
    }

    set normValue(v) {
        this._normValue = v;

        let children = this.children;

        for (const child of children) {
            if (child.normValue == v) {
                // console.log(child.value);
                this.value = child.value;
                this.shadowRoot.getElementById("selected").textContent =
                    this.value;
            }
        }
    }

    get normValue() {
        return this._normValue;
    }

    get value() {
        return this._value;
    }
}

// const optTemplate = `

// `;

export class InputOption extends Base {
    #_init = false;
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._normValue = null;

        /**@private */
        this._selected = false;

        this.shadowRoot.innerHTML += optTemplate;

        this.onpointerup = (e) => {
            this.dispatchEvent(new InputEvent("option", { bubbles: true }));
        };
    }

    connectedCallback() {
        if (!this.#_init) {
            let norm_value = this.getAttribute("norm-value");
            if (norm_value) {
                this.normValue = +norm_value;
            }
            if (this.textContent) {
                this._value = this.textContent;
            }
            this.#_init = true;
        }
    }

    /**@param {string} v */
    set value(v) {
        this._value = v;
        this.textContent = v;
    }

    get value() {
        return this._value;
    }

    /**@param {number} v */
    set normValue(v) {
        this._normValue = v;
    }

    get normValue() {
        return this._normValue;
    }

    /**@param {boolean} bool */
    set selected(bool) {
        (bool && this.toggleAttribute("selected", true)) ||
            this.removeAttribute("selected");
        this._selected = bool;
    }

    get selected() {
        return this._selected;
    }
}
