import { Base } from "./base.js";
import { InputNumber } from "./number.js";

const rangeTemplate = `
<style>
    :host{
        width: max-content;
        position: relative;

        width: 144px;
        display: flex;

        cursor: pointer;
    }

    * {
        user-select: none;
        -webkit-user-select: none;
        box-sizing: border-box;
    }

    svg[moving] text {
        opacity: 1;
    }

    text {
        opacity: 0;
        transition-delay: 500ms;
        transition-duration: 325ms;
        transition-timingfunction: ease;
        transition-property: opacity;
    }

    :host(:hover) text{
        transition-delay: 0ms;
    }

    circle {
        transition: r 200ms ease;
    }

    :host(:active) circle,:host(:focus) circle{
        r: 4px;
        fill: none;
        stroke: currentColor;
    }

    :host(:active) input-number::part(input) { }
    
    svg {
        overflow: visible;
    }

    input-number {
        position: absolute;
        top: 12px;
        left: 0;
        overflow: visible;
    }

    input-number {
        transform: translateX(8px);
        opacity: 0;
        transition-delay: 500ms;
        transition-duration: 325ms;
        transition-timingfunction: ease;
        transition-property: opacity;
    }

    :host(:hover) input-number,
    :host(:focus-within) input-number{
        opacity: 1;
        transition-duration: 125ms;
        transition-delay: 0ms;
    }

    svg {
        /* outline: 1px currentColor solid; */
        padding-inline: 8px;
        width: 100%;
    }

    </style>
    <svg height="16">
    <g id="track" transform="translate(0 8)">
        <rect width="100%" height="2" y="-1"></rect>
        <circle cx="0" cy="0" r="3" fill="currentColor" />
        <text dy="-8" id="stepping">1</text>
    </g>
</svg>
<input-number></input-number>
`;

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
    // console.log("inside map: ", x);
    let inRange = inMax - inMin;
    let w = (x - inMin) / inRange;
    let outRange = outMax - outMin;
    return outMin + w * outRange;
}

export class InputRange extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._minmax = { min: 0, max: 128 };

        /**@private */
        this._step = 1;

        this._f = 1;
        /**@type {DOMRect} */
        this._box = null;

        this._width = 128;

        this.shadowRoot.innerHTML += rangeTemplate;
        this.svg = this.shadowRoot.querySelector("svg");

        this.svg.onpointerdown = (e) => {
            this.svg.setPointerCapture(e.pointerId);

            let box = this.svg.getBoundingClientRect();
            this._box = box;

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

            this.svg.onpointermove = (ee) => {
                let ax = ee.clientX - box.x - 8;
                if (false) {
                    x = ax;
                } else {
                    if (this.normValue >= 1 && ax > w + this.range / 2) {
                        x = w;
                    } else if (this.normValue <= 0 && ax < -this.range / 2) {
                        x = 0;
                    } else {
                        x = x + ee.movementX * ratio;
                    }
                }

                x = clamp(x, 0, w);
                this.normValue = x / w;
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
        return this._width;
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

    /**@param {number} n */
    set steps(n) {
        // this._step = n;
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

        if (this._value != f) {
            this._value = f;

            let x = this.normValue * this.width;

            this.svg.querySelector("circle").setAttribute("cx", x.toString());

            this.shadowRoot.querySelector(
                "input-number"
            ).style.left = `${x.toString()}px`;

            this.shadowRoot.querySelector("input-number").value = Math.round(f);
        }
    }

    get value() {
        return this._value;
    }
}
