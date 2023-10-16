import { Base } from "./base.js";

const buttonTemplate = `
<style>
    #button {
        border: 1px currentColor solid;
        border-radius: 2px;
        
        width: max-content;

        padding-block: 0.125ch;
        padding-inline: 0.35ch;

        user-select: none;
        -webkit-user-select: none;

        cursor: pointer;

        background-color: white;

        transition: 100ms ease filter;

    }

    #button:active {
        filter: invert(1);
    }
</style>
<div id="button">
    <slot></slot>
</div>
`;

export class InputButton extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += buttonTemplate;

        this.onpointerdown = (e) => {
            this.dispatchEvent(new InputEvent("change", { bubbles: true }));
        };
    }

    get normValue() {
        return true;
    }

    get value() {
        return true;
    }
}
