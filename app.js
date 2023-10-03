/**
 * @param {Object} param
 * @param {string[]} param.list
 * @param {boolean} param.indexed
 * @returns {string} HTMLString
 */
function selectTemplate({ list, indexed }) {
    return `
<select id="parameter">
${list
    .map(
        (item, i) => `\t<option value="${indexed ? i : item}">${item}</option>`
    )
    .join("\n")}
</select>
  `;
}

/**
 * @param {Object} param
 * @param {number} param.min
 * @param {number} param.max
 * @param {number} param.value
 * @param {number} param.step
 * @param {boolean} param.output
 * @returns {string} HTMLString
 */
function rangeTemplate({ min, max, value, step, output }) {
    let htmlString = `<input id="parameter" type="range" min="${min}" max="${max}" step="${step}" value="${value}" /> `;

    if (output) {
        htmlString += `<input id="output" type="number" value="${value.toFixed(
            3
        )}" min="${min}" max="${max}" step="${step}" />`;
    }

    return htmlString;
}

/**
 * @param {Object} param
 * @param {boolean} param.checked
 * @returns {string} HTMLString
 */
function checkTemplate({ checked }) {
    return `<input id="parameter" type="checkbox" ${
        checked ? "checked" : ""
    } />`;
}

/**
 *
 * @template {HTMLElement} H
 * @param {Object} param
 * @param {string} param.value
 * @param {H} param.acceptType
 */
function pickerTemplate({ value = "", acceptType }) {
    let htmlString = "";
    htmlString += `<input id="parameter" type="button" value="${value}" />`;
    return htmlString;
}

/**
 * @param {PointerEvent} e
 */
function pickerHandler(a, e) {
    window.onpointerdown = (ee) => {
        if (ee.target instanceof a && ee.target != this) {
            console.log(ee.target.value);
            console.log(ee.target.getName());
            this.value = ee.target.getName();
            window.onpointerdown = null;
        }
    };
}

const TYPE_TEMPLATES = {
    select: selectTemplate,
    range: rangeTemplate,
    checkbox: checkTemplate,
    picker: pickerTemplate,
};

class XInput extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
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
          

          input,select {
            font-family: inherit;
            color: inherit;
            font-size: inherit;

            border: none;
            border-radius: 1px;
            background-color: transparent;

            padding: 4px;
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

        this.shadowRoot.innerHTML += `<label for="parameter"></label>`;

        this.shadowRoot.addEventListener("change", (e) => {
            this.dispatchEvent(new Event("change", { bubbles: true }));
        });

        this.shadowRoot.addEventListener("input", (e) => {
            const output = this.shadowRoot.getElementById("output");

            if (!output) return;

            if (e.target == output) {
                this.shadowRoot.querySelector("input:not(#output)").value =
                    e.target.value;
                return;
            }

            output.value = (+e.target.value).toFixed(3);

            this.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }

    /**
     * @template {keyof typeof TYPE_TEMPLATES} T
     * @param {T} type
     * @param {Parameters<typeof TYPE_TEMPLATES[T]>[0]} opt
     */
    setType(type, opt) {
        const template = TYPE_TEMPLATES[type];
        this.shadowRoot
            .querySelectorAll(":not(style):not(label)")
            .forEach((el) => el.remove());
        this.shadowRoot.innerHTML += template(opt);

        if (type == "picker") {
            this.onpointerdown = pickerHandler.bind(this, opt.acceptType);
            // window.onpointerdown = pickerHandler.bind(this, opt.acceptType);
        } else {
            window.onpointerdown = null;
        }
    }

    /**@param {string} name */
    setName(name) {
        this.shadowRoot.querySelector("label").textContent = name;
    }

    getName() {
        return this.shadowRoot.querySelector("label").textContent;
    }

    /**@type {HTMLInputElement} */
    get value() {
        const input = this.shadowRoot.querySelector(
            "input:not(#output),select"
        );

        if (input.type == "checkbox") {
            return input.checked;
        }

        return input.value;
    }

    set value(value) {
        const input = this.shadowRoot.querySelector("input:not(#output)");
        input.value = value;
    }
}

customElements.define("x-input", XInput);

/**@type {XInput} */
const xInp0 = document.createElement("x-input");
xInp0.setType("select", { list: ["col", "blo", "bla"], indexed: false });
xInp0.setName("stuff");

/**@type {XInput} */
const xInp1 = document.createElement("x-input");
xInp1.setType("range", {
    min: 0,
    max: 1,
    value: 0.5,
    step: 0.001,
    output: true,
});
xInp1.setName("amp");

/**@type {XInput} */
const xInp2 = document.createElement("x-input");
xInp2.setType("checkbox", { checked: false });
xInp2.setName("switch");

/**@type {XInput} */
const xInp3 = document.createElement("x-input");
xInp3.setType("picker", {
    checked: false,
    value: "[:]",
    acceptType: XInput,
});
// xInp3.setName("module");

document.body.append(xInp0, xInp1, xInp2, xInp3);

document.body.addEventListener("change", (e) => {
    // console.log(e.target.value);
});
