const reset = `
<style>
  :host {

    display: flex;
    align-items: center;

    gap: 2px;
  }

  label:empty{
    display: none;
  }

  :host(:focus){
  }

  :where(select,input:not([type="checkbox"])){
    -webkit-appearance: none;
  }

  :where(select,input):focus {
    outline: 1px currentColor solid;
    outline-offset: 1px;
  }

  select,input:not([type="number"]){
    cursor: pointer;
  }

  select,input[type="button"]{
    border: 1px currentColor solid;
    border-radius: 2px;
    background-color: white;
  }

  input[type="button"]:active{
    /*background-color: currentColor;*/
    filter: invert(1);
  }

  input[type="checkbox"]{
    -webkit-appearance: none;
    apperance: none;
    margin: 0;

    border: 1px currentColor solid;

    display: grid;
    place-content: center;

    padding: 0;
  }

  input[type="checkbox"]::before {
    content: '';
    width: 10px;
    height: 10px;
  }

  input[type="checkbox"]:checked::before{
    background-color: currentColor;
  }


  input[type="number"]{
    width: 8ch;
  }

</style>
`;

const baseTemplateStyle = `
  <style>
    :host {
    }

    :host(:focus-within){
      outline: 1px currentColor dashed;
      outline-offset: 1px;
    }

    :focus{
      outline: none;
    }
  </style>
`;

class Base extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML += baseTemplateStyle;

        this.shadowRoot.addEventListener("change", (e) => {
            this.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }
}

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
            // this.svg
            //     .querySelector("circle")
            //     .style.setProperty("cx", `${128 * f}px`);
            this.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    get value() {
        return this._value;
    }
}

customElements.define("input-range", InputRange);

const selectTemplateStyle = `
<style>
  *{
    user-select: none;
    -webkit-user-select: none;
  }
  :host{
    border: 1px currentColor solid;
    display: grid;
    width: max-content;
    border-radius: 2px;
  }

  #select{
    position: relative;
    cursor: pointer;
  }

  #selected{
    padding: 2px;
  }

  #options {
    margin-top: 6px;
    min-width: 100%;
    position: absolute;
    left: -1px;
    background-color: white;
    flex-direction: column;
    display: flex;
    gap: 4px;
    padding: 4px;
    background-color: white;
    border: 1px currentColor solid;
    border-radius: 2px;
    pointer-events: none;
    transform: translateY(-4px);

    opacity: 0;
    transition-duration: 500ms,100ms;
    transition-timingfunction: ease;
    transition-property: transform,opacity;
    transition-delay: 50ms,200ms;
  }

  #select,#options{
  }

  :host([open]) #options{
    pointer-events: unset;
    opacity: 1;
    transition-duration: 200ms,100ms;
    transform: translateY(0);
    transition-delay: 0ms;
  }

  :host([open]) #options{
    display: flex;
  }

  :host([open]) #selected{
  }

  ::slotted(input-opt:hover){
    outline: 1px currentColor dashed;
    outline-offset: 1px;
  }

  ::slotted(input-opt){
  }

  :host(:not([open])) ::slotted(input-opt:not([selected])){
  }

  

  ::slotted(input-opt[selected]){
    display: none;
  }

</style>
<div id="select" tabindex="0">
  <div id="selected"></div>
  <div id="options">
    <slot></slot>
  </div>
</div>
`;

/**@type {typeof clickOutsideHandler} */
let boundClickOutsideHandler;

function clickOutsideHandler(e) {
    const target = e.target;
    const parentSelect = target.closest("input-select");
    // console.log(e);
    if (this != parentSelect) {
        // console.log("outside");
        this.removeAttribute("open");
        window.removeEventListener("pointerdown", boundClickOutsideHandler);
    }
}

export class InputSelect extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;

        this.shadowRoot.innerHTML += selectTemplateStyle;
        this.shadowRoot.addEventListener("slotchange", (e) => {
            /**@type {InputOption} */
            const firstOpt = this.querySelector("input-opt:first-of-type");
            const selected = this.shadowRoot.getElementById("selected");
            selected.textContent = firstOpt.textContent;
            firstOpt.selected = true;
            this.value = firstOpt.value;
        });

        this.shadowRoot.addEventListener("keydown", (e) => {
            if (e.key == "Escape") {
                this.shadowRoot
                    .getElementById("selected")
                    .dispatchEvent(
                        new PointerEvent("pointerdown", { bubbles: true })
                    );
            }
            if (e.key == "Tab") {
                const shift = e.shiftKey;

                let next = e.target.nextElementSibling;
                next = next?.hasAttribute("selected")
                    ? next.nextElementSibling
                    : next;

                let prev = e.target.previousElementSibling;
                prev = prev?.hasAttribute("selected")
                    ? prev.previousElementSibling
                    : prev;

                console.log(prev);

                if (!shift && !next) e.preventDefault();
                if (shift && !prev) e.preventDefault();
            }
            if (e.key == "Enter" || e.key == " ") {
                if (!this.hasAttribute("open")) {
                    this.shadowRoot
                        .getElementById("selected")
                        .dispatchEvent(
                            new PointerEvent("pointerdown", { bubbles: true })
                        );
                } else {
                    e.target.dispatchEvent(
                        new PointerEvent("pointerdown", { bubbles: true })
                    );
                }
            }
        });

        this.shadowRoot.addEventListener("pointerdown", (e) => {
            if (e.target.id == "selected") {
                if (!this.hasAttribute("open")) {
                    this.querySelectorAll("input-opt:not([selected]").forEach(
                        (o, i) => {
                            o.tabIndex = 0;
                        }
                    );
                    this.querySelector("input-opt:not([selected])").focus();

                    this.toggleAttribute("open", true);
                    window.addEventListener(
                        "pointerdown",
                        (boundClickOutsideHandler =
                            clickOutsideHandler.bind(this))
                    );
                } else {
                    this.removeAttribute("open");
                    this.querySelectorAll("input-opt").forEach((o) =>
                        o.removeAttribute("tabindex")
                    );
                }
            }

            if (e.target instanceof InputOption) {
                window.removeEventListener(
                    "pointerdown",
                    boundClickOutsideHandler
                );
                this.removeAttribute("open");
                this.querySelectorAll("input-opt").forEach((o) =>
                    o.removeAttribute("tabindex")
                );

                if (this.value == e.target.value) {
                    return;
                }

                this.querySelectorAll("input-opt").forEach(
                    (o) => (o.selected = o == e.target)
                );

                this.value = e.target.value;

                this.shadowRoot.getElementById("selected").textContent =
                    e.target.label;

                this.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
            }
        });
    }

    /**@param {string[]} v */
    set list(v) {
        const optList = v.map((s, i) => {
            const opt = document.createElement("input-opt");
            opt.value = i;
            opt.label = s;
            return opt;
        });
        this.querySelectorAll("input-opt").forEach((o) => o.remove());
        this.append(...optList);
    }

    set value(v) {
        this._value = v;
    }

    get value() {
        return this._value;
    }
}

customElements.define("input-select", InputSelect);

const optTemplate = `
<style>
</style>
<slot></slot>
`;

export class InputOption extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;
        /**@private */
        this._selected = false;

        this.shadowRoot.innerHTML += optTemplate;
    }

    /**@param {number} v */
    set value(v) {
        this._value = v;
    }

    get value() {
        return this._value;
    }

    /**@param {string} v */
    set label(v) {
        // this._label = v;
        this.textContent = v;
    }

    get label() {
        return this.textContent;
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

customElements.define("input-opt", InputOption);

const switchTemplate = `
<style>
  :host {
    display: grid;
    width: max-content;
    place-content: center;
    cursor: pointer;
    margin-block: 4px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px currentColor solid;
  }

  svg {
    padding: 1.5px;
    display: block;
  }

  circle {
    transition: cx 75ms ease;
  }

  :host([open]) circle {
    cx: 12px;
  }
</style>
<svg width="16" height="8" tabindex="0">
  <g transform="translate(0 4)">
    <circle cx="4" r="4" />
  </g>
</svg>
`;

export class InputSwitch extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += switchTemplate;

        /**@private */
        this._value = null;

        this.onpointerdown = (e) => {
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
}

customElements.define("input-switch", InputSwitch);

const inpRange0 = document.createElement("input-range");
inpRange0.minmax = { min: 0, max: 1 };
inpRange0.steps = 32;
inpRange0.value = 0.5;

const inpSelect0 = document.createElement("input-select");
inpSelect0.list = ["sine", "tri", "ramp up", "ramp down"];

const inpSwitch0 = document.createElement("input-switch");

document.body.append(inpRange0, inpSelect0, inpSwitch0);

document.body.addEventListener("change", (e) => {
    console.log(e.target.value);
});

document.body.addEventListener("input", (e) => {
    // console.log(e.target.value);
});
