import { Base } from "./base.js";

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
        transition-duration: 500ms,150ms;
        transition-timingfunction: ease;
        transition-property: transform,opacity;
        transition-delay: 0ms,200ms;
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

    ::slotted(input-opt:hover){
        outline: 1px currentColor dashed;
        outline-offset: 1px;
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
    if (this != parentSelect) {
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
            if (e.target.id == "selected") {
                if (!this.hasAttribute("open")) {
                    this.toggleAttribute("open", true);
                    window.addEventListener(
                        "pointerdown",
                        (boundClickOutsideHandler =
                            clickOutsideHandler.bind(this))
                    );
                } else {
                    this.removeAttribute("open");
                }
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
