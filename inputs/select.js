import { Base } from "./base.js";

const selectTemplateStyle = `
<style>
    *{
        user-select: none;
        -webkit-user-select: none;
    }
    :host{
        border: 1px #0003 solid;
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
        display: none;
        z-index: 100;

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
        border: 1px #0003 solid;
        border-radius: 2px;
        pointer-events: none;

        box-shadow: 0 0 8px 4px hsl(0 0% 0% / 0.025);

        opacity: 0;
    }

    :host([open]) #options {
        pointer-events: unset;
    }

    ::slotted(input-opt:hover){
        outline: 1px #0003 dashed;
        outline-offset: 1px;
    }

    ::slotted(input-opt[selected]){
        display: none;
    }

</style>
<div id="select" tabindex="0">
    <div id="selected" onpointerdown="$E(event,'open')"></div>
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
    // const target = e.target;
    // const parentSelect = target.closest("input-select");

    // console.log(target, parentSelect);

    // if (this != parentSelect) {
    //     // this.close();
    // }
    this.close();
}

export class InputSelect extends Base {
    constructor() {
        super();

        /**@private */
        this._value = null;

        /**@private */
        this._normValue = null;

        /**@private */
        this._state = false;

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
                this.close();

                this._state = false;

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
            this._state = !this._state;

            this._state ? this.open() : this.close();
        });
    }

    open() {
        this._state = true;
        /**@type {HTMLElement} */
        const options = this.shadowRoot.querySelector("#options");
        options.style.display = "flex";
        this.toggleAttribute("open", true);

        const box = options.getBoundingClientRect();
        const docHeight = document.documentElement.clientHeight;

        if (box.y + box.height + 8 > docHeight) {
            options.style.bottom = "100%";
        }

        /**@type {Keyframe[]} */
        let keyFrames = [
            {
                transform: `translateY(${-4}px)`,
            },
            {
                transform: `translateY(0)`,
            },
        ];

        options.animate(keyFrames, {
            fill: "forwards",
            duration: 100,
        }).onfinish = (ae) => {};

        options.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 100,
            fill: "forwards",
        });

        setTimeout(() => {
            window.addEventListener(
                "pointerdown",
                (boundClickOutsideHandler = clickOutsideHandler.bind(this))
            );
        }, 0);
    }

    close() {
        this._state = false;
        /**@type {HTMLElement} */
        const options = this.shadowRoot.querySelector("#options");
        this.removeAttribute("open");

        /**@type {Keyframe[]} */
        let keyFrames = [
            {
                transform: `translateY(${-4}px)`,
            },
            {
                transform: `translateY(0)`,
            },
        ];

        options.animate(keyFrames, {
            fill: "forwards",
            duration: 300,
            direction: "reverse",
        }).onfinish = (ae) => {
            options.style.removeProperty("bottom");
            options.style.display = "none";
        };

        options.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 100,
            delay: 150,
            fill: "forwards",
            direction: "reverse",
        });

        window.removeEventListener("pointerdown", boundClickOutsideHandler);
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
