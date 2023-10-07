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

const rangeTemplateStyle = `
<style>
    input[type="range"] {
        cursor: pointer;
        -webkit-appearance: none;
        background-color: transparent;
    }
    
    input[type="range"]:focus {
        outline: none;
    }
    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        background: currentColor;
        border-radius: 40px;
    }
    input[type="range"]::-webkit-slider-thumb {
        height: 8px;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background: currentColor;
        -webkit-appearance: none;
        margin-top: -3px;
    }
    
    input[type="range"]:active::-webkit-slider-thumb {
    }
    
    input[type="range"]::-moz-range-track {
        width: 100%;
        height: 2px;
        background: currentColor;
        border-radius: 40px;
    }
    
    input[type="range"]::-moz-range-thumb {
        height: 8px;
        width: 8px;
        border-radius: 50%;
        background: currentColor;
        margin-top: -3px;
        border: none;
    }
</style>
`;

export class InputRange extends Base {
    constructor() {
        super();
        this.shadowRoot.innerHTML += rangeTemplateStyle;

        this.input = document.createElement("input");
        this.input.type = "range";

        this.shadowRoot.appendChild(this.input);
    }

    /**@param {{min:number,max:number}} o  */
    set minmax({ min, max }) {
        this.input.min = min.toString();
        this.input.max = max.toString();
    }

    /**@param {number} v */
    set steps(v) {
        const min = +this.input.min;
        const max = +this.input.max;
        const range = max - min;
        const rangeStep = range / v;
        this.input.step = rangeStep.toString();
    }

    /**@param {number} v*/
    set value(v) {
        this.input.value = v.toString();
    }

    get value() {
        return +this.input.value;
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
    display: contents;
  }

  #select{
    border: 1px currentColor solid;
    position: relative;
    width: max-content;
    cursor: pointer;
  }

  #select,#options{
    display: flex;
    flex-direction: column;
  }

  :host([open]){
  }

  :host([open]) #options{
    display: flex;
  }

  :host([open]) #selected{
    font-weight: 1000;
    cursor: default;
  }

  :host([open]) ::slotted(input-opt:hover){
    color: red;
  }

  :host(:not([open])) ::slotted(input-opt:not([selected])){
    display: none;
  }

  ::slotted(input-opt[selected]){
    display: none;
  }

</style>
<div id="select">
  <div id="options">
    <div id="selected"></div>
    <slot></slot>
  </div>
<div>
`;

/**@type {typeof clickOutsideHandler} */
let boundClickOutsideHandler;

function clickOutsideHandler(e) {
    const target = e.target;
    const parentSelect = target.closest("input-select");
    // console.log(e);
    if (this != parentSelect) {
        console.log("outside");
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

        this.shadowRoot.addEventListener("pointerdown", (e) => {
            if (e.target.id == "selected" && !this.hasAttribute("open")) {
                this.toggleAttribute("open", true);
                window.addEventListener(
                    "pointerdown",
                    (boundClickOutsideHandler = clickOutsideHandler.bind(this))
                );
            }

            if (e.target instanceof InputOption) {
                window.removeEventListener(
                    "pointerdown",
                    boundClickOutsideHandler
                );
                this.removeAttribute("open");

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
<style></style>
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

const inpRange0 = document.createElement("input-range");
inpRange0.minmax = { min: 0, max: 1 };
inpRange0.steps = 20;
inpRange0.value = 0.05;

const inpSelect0 = document.createElement("input-select");
inpSelect0.list = ["cool", "blo", "ok"];

document.body.append(inpRange0, inpSelect0);

document.body.addEventListener("change", (e) => {
    console.log(e.target.value);
});

// const test = document.createElement("input-opt")
// test.textContent = "hello"
// document.body.appendChild(test)
