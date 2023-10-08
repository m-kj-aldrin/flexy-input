import { Base } from "./base.js";

const rangeTemplate = `
<style>
    :host{
        cursor: pointer;
        width: max-content;
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

    </style>
    <svg width="128" height="16" tabindex="0">
    <g id="track" transform="translate(0 8)">
        <path d="M0,0 h128" stroke="currentColor" line-width="1" stroke-linecap="round" />
        <circle cx="0" cy="0" r="4" fill="currentColor" />
    </g>
    <text x="0" y="24" font-size="10">hello</text>
</svg>
`;

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

/**
 * @param {number} x
 * @param {number} q
 */
function quantize(x, q) {
    let d = x / q;
    x = Math.floor(+d.toPrecision(12));
    const v = x * q;
    return +v.toPrecision(12);
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

        this.shadowRoot.innerHTML += rangeTemplate;
        this.svg = this.shadowRoot.querySelector("svg");

        this.svg.onpointerdown = (e) => {
            this.svg.setPointerCapture(e.pointerId);

            const box = this.svg.getBoundingClientRect();

            let x = clamp(e.clientX - box.x, 0, box.width);

            const circle = this.svg.querySelector("circle");
            let currentX = +circle.getAttribute("cx");

            const newValue = x / (box.width - 1);

            if (this.value != newValue) {
                this.value = newValue;
            }

            this.svg.onpointermove = (ee) => {
                currentX = +circle.getAttribute("cx");
                x = clamp(ee.clientX - box.x, 0, box.width);
                if (currentX != x) {
                    this.value = x / (box.width - 1);
                }
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
        const { min, max } = this._minmax;
        const rangeStep = (max - min) / n;
        this._step = rangeStep;
    }

    /**@param {number} v */
    set value(v) {
        const { min, max } = this.minmax;
        const range = max - min;
        const f = quantize(range * v, this._step);
        if (this._value != f) {
            this._value = f;
            this.svg.querySelector("circle").setAttribute("cx", 128 * f);
            this.svg.querySelector("text").setAttribute("dx", 128 * f);
            this.svg.querySelector("text").textContent = this._value;
            this.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    get value() {
        return this._value;
    }
}
