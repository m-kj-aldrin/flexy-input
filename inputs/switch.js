import { Base } from "./base.js";

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
    transition: cx 200ms cubic-bezier(1, -0.01, 0, 1.05);
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

    get normValue() {
        return this._value;
    }

    set normValue(v) {
        this.value = v;
    }
}
