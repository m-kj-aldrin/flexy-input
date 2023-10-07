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
    input,select {
      font-family: inherit;
      color: inherit;
      font-size: inherit;

      border: none;
      border-radius: 1px;
      background-color: transparent;

      padding: 4px;
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

const inputTemplate = `

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

const inpRange0 = document.createElement("input-range");
inpRange0.minmax = { min: 0, max: 1 };
inpRange0.steps = 20;
inpRange0.value = 0.05;

document.body.appendChild(inpRange0);

document.body.addEventListener("change", (e) => {
    console.log(e.target.value);
});
