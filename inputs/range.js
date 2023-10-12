import { Base } from "./base.js";
import { InputNumber } from "./number.js";

const rangeTemplate = `
<style>
    :host{
        cursor: pointer;
        width: max-content;
        position: relative;

        width: 64px;
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

    :host(:active) circle,:host(:focus) circle{
        r: 4px;
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
        outline: 1px currentColor solid;
        padding-inline: 8px;
        width: 100%;
    }

    </style>
    <svg tabindex="0" height="16">
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
    /**@type {DOMRect} */
    this._box = null;

    this._width = 0;

    this.shadowRoot.innerHTML += rangeTemplate;
    this.svg = this.shadowRoot.querySelector("svg");

    this.svg.onpointerdown = (e) => {
      this.svg.setPointerCapture(e.pointerId);

      let box = this.svg.getBoundingClientRect();
      console.log(box.width, this.width);
      this._box = box;

      //   let w = box.width - 16;
      let w = this.width;
      this._width = w;
      let x = e.clientX - box.x - 8;
      x = clamp(x, 0, w);

      this.value = x / w;

      let ratio = this._step > w ? w / this._step : 1;

      this.svg.onpointermove = (ee) => {
        x = x + ee.movementX * ratio;
        x = clamp(x, 0, w);
        this.value = x / w;
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

  set width(v) {
    this._width = v + 16;
    this.style.width = `${v}px`;
  }

  get width() {
    // const box = this.svg.getBoundingClientRect();
    // return box.width - 16;
    return this._width;
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
    this._step = n;
  }

  /**@param {number} v */
  set value(v) {
    const f = v;
    if (this._value != f) {
      this._value = f;
      let x = f * this.width;
      //   console.log(x);
      this.svg.querySelector("circle").setAttribute("cx", x.toString());
      this.shadowRoot.querySelector(
        "input-number"
      ).style.left = `${x.toString()}px`;
      this.shadowRoot.querySelector("input-number").value = Math.round(
        f * this._step
      );
    }
  }

  get value() {
    return this._value;
  }
}
