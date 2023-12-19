import { Base } from "../base.js";
import { InputNumber } from "../number/number.js";
import rangeTemplate from "./range.component.html?inline";

// const rangeTemplate = `

// `;

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

/**
 * @param {number} x
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 */
function map(x, inMin, inMax, outMin, outMax) {
    let inRange = inMax - inMin;
    let w = (x - inMin) / inRange;
    let outRange = outMax - outMin;
    return outMin + w * outRange;
}

export class InputRange extends HTMLElement {
    #_init = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        /**@private */
        this._value = null;

        /**@private */
        this._minmax = { min: 0, max: 512 };

        this._step = 512;

        this._width = 128;

        this.shadowRoot.innerHTML += rangeTemplate;
        this.svg = this.shadowRoot.querySelector("svg");

        this.svg.onpointerdown = (e) => {
            this.svg.setPointerCapture(e.pointerId);

            let box = this.svg.getBoundingClientRect();

            let w = this.width;
            let x = 0;
            if (!e.shiftKey) {
                x = e.clientX - box.x - 8;
                x = clamp(x, 0, w);
            } else {
                x = this.normValue * w;
            }

            this.normValue = x / w;

            let ratio = this._step > w ? w / this._step : 1;

            this.dispatchEvent(new InputEvent("input", { bubbles: true }));

            this.svg.onpointermove = (ee) => {
                let ax = ee.clientX - box.x - 8;

                if (this.normValue >= 1 && ax > w + this.range / 2) {
                    x = w;
                } else if (this.normValue <= 0 && ax < -this.range / 2) {
                    x = 0;
                } else {
                    x = x + ee.movementX * ratio;
                }

                x = clamp(x, 0, w);
                this.normValue = x / w;

                this.dispatchEvent(new InputEvent("input", { bubbles: true }));
            };
        };

        let prevVal = null;

        this.svg.onpointerup = (e) => {
            this.style.removeProperty("cursor");

            if (prevVal != this.value) {
                prevVal = this.value;
                this.dispatchEvent(new InputEvent("change", { bubbles: true }));
            }
            this.svg.removeAttribute("moving");
            this.svg.releasePointerCapture(e.pointerId);
            this.svg.onpointermove = null;
        };

        this.shadowRoot.addEventListener(
            "change",
            /**@param {InputEvent & {target: InputNumber}} e */
            (e) => {
                this.value = e.target.value;
                e.target.value = this.value;
                this.dispatchEvent(new InputEvent("change", { bubbles: true }));
            }
        );
    }

    set width(v) {
        this._width = v;
        this.style.width = `${v + 16}px`;
    }

    get width() {
        return +this.style.width.replace("px", "") - 16;
    }

    /**@param {{min:number,max:number}} o */
    set minmax({ min, max }) {
        this._minmax = { min, max };
        this._step = max - min;
    }

    get range() {
        const { min, max } = this._minmax;
        return max - min;
    }

    get minmax() {
        return this._minmax;
    }

    /**@param {number} v */
    set normValue(v) {
        const { min, max } = this._minmax;
        this.value = map(v, 0, 1, min, max);
    }

    get normValue() {
        const { min, max } = this._minmax;
        return map(this.value, min, max, 0, 1);
    }

    /**@param {number} v */
    set value(v) {
        const { min, max } = this._minmax;
        const f = clamp(v, min, max);

        if (true) {
            this._value = f;

            let x = this.normValue * this.width;

            this.svg
                .querySelector("circle")
                .style.setProperty("--x", this.normValue.toString());

            this.shadowRoot
                .querySelector("input-number")
                .style.setProperty("--x", this.normValue.toString());

            this.shadowRoot.querySelector("input-number").value = Math.round(f);
        }
    }

    get value() {
        return this._value;
    }

    connectedCallback() {
        if (!this.#_init) {
            let w = this.getAttribute("width");
            if (w) {
                this.width = +w;
            }
            let v = this.getAttribute("norm-value");
            if (v) {
                this.normValue = +v;
            }
            let mm = this.getAttribute("min-max");
            if (mm) {
                let [min, max] = mm.split(" ");
                let n = this.normValue;
                this.minmax = {
                    min: +min,
                    max: +max,
                };
                this.normValue = n;
            }

            this.#_init = true;
        }
    }
}
