import { Base } from "./base.js";

const numberTemplate = `
<style>
    :host {
        overflow: visible;
    }
    input {
        font-family: inherit;
        width: calc(var(--n,1) * 1ch + 0.125ch);
        min-width: 1ch;
        text-align: center;
        padding-inline: 0.25ch;
        border: none;
        border-bottom: 1px currentColor solid;
        overflow: visible;
    }
</style>
`;

export class InputNumber extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += numberTemplate;

        /**@private */
        this.input = document.createElement("input");
        this.input.type = "text";

        this.shadowRoot.appendChild(this.input);

        this.precision = 18;

        const re = new RegExp(/[^\d]/);
        const re2 = new RegExp(/[\.]|Enter|Backspace|ArrowLeft|ArrowRight/);

        this.input.onkeydown = (e) => {
            if (e.metaKey) {
                return;
            }
            if (re.test(e.key)) {
                if (e.target.value.indexOf(".") > 0 && e.key == ".") {
                    e.preventDefault();
                }
                if (!re2.test(e.key)) {
                    e.preventDefault();
                }
            }

            if (!isNaN(+e.key)) {
                if (e.key == "0" && !e.target.value.length) {
                    e.target.value = "0.";
                    e.preventDefault();
                }

                if (!e.target.value.length && e.key != "1") {
                    e.target.value = "0.";
                }

                if (e.target.value.length > this.precision) {
                    e.preventDefault();
                }
            }

            if (e.key == "Backspace" && e.target.value == "0.") {
                e.target.value = "";
            }

            e.target.style.setProperty("--n", e.target.value.length);
        };

        /**@type {(e:InputEvent) => void} */
        this.input.oninput = (e) => {
            e.target.style.setProperty("--n", e.target.value.length);
        };

        this.input.onchange = (e) => {
            if (e.target.value > 1) {
                e.target.value = 1;
            }

            e.target.value = parseFloat(e.target.value);
            e.target.style.setProperty("--n", e.target.value.length);

            this.dispatchEvent(new Event("change", { bubbles: true }));
        };
    }

    updateWidth() {
        this.input.style.setProperty("--n", this.input.value.length);
    }

    set value(v) {
        this.input.value = v;
        this.updateWidth();
    }

    get value() {
        return +this.input.value;
    }
}
