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
        display:none;

        margin-block: 6px;
        min-width: 100%;
        position: absolute;
        left: -1px;
        background-color: white;
        flex-direction: column;
        gap: 4px;
        padding: 4px;
        background-color: white;
        border: 1px currentColor solid;
        border-radius: 2px;
        pointer-events: none;

        transform: translateY(-2px);

        opacity: 0;
        transition-duration: 250ms,150ms;
        transition-timingfunction: ease;
        transition-property: transform,opacity;
        transition-delay: 0ms,150ms;
    }

    #options[direction="up"]{
        bottom: 100%;
        transform: translateY(2px);
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
    <div id="selected" onpointerdown="this.dispatchEvent(new CustomEvent('open',{bubbles:true}))"></div>
    <div id="options">
        <slot></slot>
    </div>
</div>
`;

/**@type {typeof clickOutsideHandler} */
let boundClickOutsideHandler;

/**
 * @this {InputSelect}
 * @param {PointerEvent & {target:HTMLElement}} e
 */
function clickOutsideHandler(e) {
    const target = e.target;
    const parentSelect = target.closest("input-select");

    if (this != parentSelect) {
        this.removeAttribute("open");
        this.shadowRoot.querySelector("#options").ontransitionend = (te) => {
            te.target.removeAttribute("direction");
            te.target.style.removeProperty("display");
            te.target.ontransitionend = null;
        };
        window.removeEventListener("pointerdown", boundClickOutsideHandler);
    }
}

export class InputSelect extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._normValue = null;

        this.shadowRoot.innerHTML += selectTemplateStyle;
        this.shadowRoot.addEventListener("slotchange", (e) => {
            /**@type {InputOption} */
            const firstOpt = this.querySelector("input-opt:first-of-type");
            const selected = this.shadowRoot.getElementById("selected");
            selected.textContent = firstOpt.textContent;
            firstOpt.selected = true;
            this.value = firstOpt.value;
        });

        this.addEventListener(
            "option",
            /**@param {InputEvent & {target: InputOption}} e */
            (e) => {
                window.removeEventListener(
                    "pointerdown",
                    boundClickOutsideHandler
                );
                this.removeAttribute("open");

                /**@type {HTMLElement} */
                const options = this.shadowRoot.querySelector("#options");
                options.ontransitionend = (te) => {
                    options.removeAttribute("direction");
                    options.style.removeProperty("display");
                    options.ontransitionend = null;
                };

                if (this.value == e.target.value) return;

                this.querySelectorAll("input-opt").forEach(
                    (o) => (o.selected = o == e.target)
                );

                this.value = e.target.value;
                this.normValue = e.target.normValue;

                this.shadowRoot.getElementById("selected").textContent =
                    e.target.textContent;

                this.dispatchEvent(new Event("change", { bubbles: true }));
            }
        );

        this.shadowRoot.addEventListener("open", (e) => {
            /**@type {HTMLElement} */
            const options = this.shadowRoot.querySelector("#options");
            options.style.display = "flex";

            requestAnimationFrame(() => {
                const state = this.toggleAttribute("open");

                if (state) {
                    window.addEventListener(
                        "pointerdown",
                        (boundClickOutsideHandler =
                            clickOutsideHandler.bind(this))
                    );

                    const box = options.getBoundingClientRect();
                    const docHeight = document.documentElement.clientHeight;

                    if (box.y + box.height + 8 > docHeight) {
                        options.setAttribute("direction", "up");
                    }
                } else {
                    window.removeEventListener(
                        "pointerdown",
                        boundClickOutsideHandler
                    );

                    options.ontransitionend = (te) => {
                        options.removeAttribute("direction");
                        options.style.removeProperty("display");
                        options.ontransitionend = null;
                    };
                }
            });
        });
    }

    /**@param {string[]} v */
    set list(v) {
        const optList = v.map((s, i) => {
            const opt = document.createElement("input-opt");
            opt.value = s;
            opt.normValue = i;
            return opt;
        });
        this.querySelectorAll("input-opt").forEach((o) => o.remove());
        this.append(...optList);
    }

    set value(v) {
        this._value = v;
    }

    set normValue(v) {
        this._normValue = v;
    }

    get normValue() {
        return this._normValue;
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
        this._normValue = null;

        /**@private */
        this._selected = false;

        this.shadowRoot.innerHTML += optTemplate;

        this.onpointerdown = (e) => {
            this.dispatchEvent(new InputEvent("option", { bubbles: true }));
        };
    }

    /**@param {string} v */
    set value(v) {
        this._value = v;
        this.textContent = v;
    }

    get value() {
        return this._value;
    }

    /**@param {number} v */
    set normValue(v) {
        this._normValue = v;
    }

    get normValue() {
        return this._normValue;
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
