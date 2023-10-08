import { Base } from "./base.js";
import { InputNumber } from "./number.js";

const rangeTemplate = `
<style>
    :host{
        cursor: pointer;
        width: max-content;
        position: relative;
    }

    :host(:active){
    }

    text {
        opacity: 0;
        transition-delay: 500ms;
        transition-duration: 325ms;
        transition-timingfunction: ease;
        transition-property: opacity;
    }

    :host(:hover) text{
        opacity: 1;
        transition-duration: 125ms;
        transition-delay: 0ms;
    }

    circle {
        transition: r 200ms ease;
    }

    :host(:active) circle{
        r: 5px;
        fill: none;
        stroke: currentColor;
    }
    
    svg {
        overflow: visible;
        display: block;
    }

    input-number {
        position: absolute;
        left: 0;
        overflow: visible;
    }

    input-number {
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

    </style>
    <svg width="128" height="16" tabindex="0">
    <g id="track" transform="translate(0 8)">
        <path d="M0,0 h128" stroke="currentColor" line-width="1" stroke-linecap="round" />
        <circle cx="0" cy="0" r="4" fill="currentColor" />
    </g>
</svg>
<input-number></input-number>
`;

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

/**
 * @param {number} x
 * @param {number} q
 */
function quantize(x, q) {
    let v = Math.floor(x * q) / q;
    return v;
}

export class InputRange extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._minmax = { min: null, max: null };

        /**@private */
        this._step = 1;

        this._f = 1;

        this.shadowRoot.innerHTML += rangeTemplate;
        this.svg = this.shadowRoot.querySelector("svg");

        this.svg.onpointerdown = (e) => {
            this.svg.setPointerCapture(e.pointerId);

            const box = this.svg.getBoundingClientRect();

            let cur = e.clientX - box.x;
            cur = clamp(cur, 0, box.width);

            this.value = cur / box.width;

            this.svg.onpointermove = (ee) => {
                let x = cur + ee.movementX * this._f;
                x = clamp(x, 0, box.width);
                this.value = x / box.width;
                cur = x;
            };
        };

        let prevVal = null;

        this.svg.onpointerup = (e) => {
            if (prevVal != this.value) {
                prevVal = this.value;
                this.dispatchEvent(new Event("change", { bubbles: true }));
            }
            this.svg.releasePointerCapture(e.pointerId);
            this.svg.onpointermove = null;
        };

        this.shadowRoot.addEventListener(
            "change",
            /**@param {InputEvent & {target: InputNumber}} e */
            (e) => {
                this.value = clamp(e.target.value / this._step, 0, 1);
            }
        );
    }

    /**@param {{min:number,max:number}} o */
    set minmax({ min, max }) {
        this._minmax = { min, max };
    }

    get minmax() {
        return this._minmax;
    }

    /**@param {number} n */
    set steps(n) {
        this._f = 128 / n;
        this._step = n;
    }

    /**@param {number} v */
    set value(v) {
        const f = quantize(v, this._step);
        if (this._value != f) {
            this._value = f;
            this.svg.querySelector("circle").setAttribute("cx", 128 * f);
            const inpNum = this.shadowRoot.querySelector("input-number");
            inpNum.style.left = `${128 * f}px`;
            inpNum.value = this._value * this._step;
            this.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    get value() {
        return this._value;
    }
}
