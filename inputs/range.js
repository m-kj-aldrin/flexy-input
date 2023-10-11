import { Base } from "./base.js";
import { InputNumber } from "./number.js";

const rangeTemplate = `
<style>
    :host{
        cursor: pointer;
        width: 144px;
        position: relative;
    }

    * {
        user-select: none;
        -webkit-user-select: none;
    }

    :host(:active){
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

    svg:active circle{
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
        outline: 1px red solid;
        --w: 256px;
        --h: 16px;
        width: 100%;
        height: var(--h);
        padding-inline: 8px;

    }

    path {
    }

    </style>
    <svg tabindex="0">
        <g id="track" transform="translate(0 8)">
        <rect width="100%" height="2" y="-1" rx="4"></rect>
        <circle cx="0" cy="0" r="4" fill="currentColor" />
            <text dy="-8" id="stepping">1</text>
        </g>
    </svg>
    <input-number></input-number>
    `;

// <line x1="0" x2="128" stroke="currentColor"></line>
// <path d="M0,0 h128" stroke="currentColor" line-width="1" stroke-linecap="round" />
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

// TODO - make x size of slider dynamic
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
        /**@type {DOMRect} */
        this._box = null;
        this._w = 0;

        this.svg.onpointerdown = (e) => {
            this.svg.setPointerCapture(e.pointerId);

            let box = this.svg.getBoundingClientRect();
            this._box = box;

            let w = box.width - 16;
            this._w = w;
            let s = this._step < w ? 1 : w / this._step;
            let x = e.clientX - 8 - 8;
            x = clamp(x, 0, w);
            this.value = x / w;

            this.svg.onpointermove = (ee) => {
                let movement = ee.movementX * s;
                x = x + movement;
                x = clamp(x, 0, w);
                this.value = x / w;
                // if (ee.ctrlKey) {
                //     !startY && (startY = ee.clientY);
                //     let y = ee.clientY - startY;
                //     y *= -1;
                //     let yQ = Math.floor(y / 10) * 4;
                //     yQ = clamp(yQ, 1, 32);
                //     stepF = yQ;
                //     this.svg.toggleAttribute("moving", true);
                //     this.svg.querySelector("#stepping").textContent =
                //         stepF.toString();
                // }
                // let x = cur + ee.movementX * this._f * stepF;
                // x = clamp(x, 0, 128);
                // this.value = x / 128;
                // cur = x;
            };
        };

        let prevVal = null;

        this.svg.onpointerup = (e) => {
            if (prevVal != this.value) {
                prevVal = this.value;
                this.dispatchEvent(new Event("change", { bubbles: true }));
            }
            this.svg.removeAttribute("moving");
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
        // const box = this.svg.getBoundingClientRect();
        // const w = box.width - 16;
        // this._f = w / n;
        this._step = n;
    }

    /**@param {number} v */
    set value(v) {
        const f = v;
        console.log(v);
        if (this._value != f) {
            this._value = f;
            this.svg.querySelector("circle").setAttribute("cx", this._w * f);
            // const inpNum = this.shadowRoot.querySelector("input-number");
            // inpNum.style.left = `${128 * f}px`;
            // inpNum.value = Math.round(this._value * this._step);
            // this.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    get value() {
        return this._value;
    }
}
