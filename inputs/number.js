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
    const updownRE = new RegExp(/ArrowUp|ArrowDown/);

    this.input.onkeydown = (e) => {
      if (e.metaKey) return;
      if (e.ctrlKey && e.key == "a") return;

      if (updownRE.test(e.key)) {
        if (e.key == "ArrowUp") {
          e.target.value = +e.target.value + 1;
        }
        if (e.key == "ArrowDown") {
          e.target.value = +e.target.value - 1;
        }

        this.dispatchEvent(new InputEvent("change", { bubbles: true }));
        // e.preventDefault();
        // return;
      }

      if (re.test(e.key)) {
        if (!re2.test(e.key)) {
          e.preventDefault();
        }
      }
    };

    /**@type {(e:InputEvent) => void} */
    this.input.oninput = (e) => {
      e.target.style.setProperty("--n", e.target.value.length);
    };

    this.input.onchange = (e) => {
      e.target.style.setProperty("--n", e.target.value.length);

      this.dispatchEvent(new InputEvent("change", { bubbles: true }));
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
