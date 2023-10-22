import { Base } from "./base.js";

const pickerTemplate = `
<style>
    :host {
        border: 1px currentColor dashed;
        border: none;
        width: max-content;
        cursor: pointer;

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        padding: 2px;

        --w: 12px;
        --h: 12px;
        
    }

    svg {
        display: block;
        width: var(--w,16px);
        height: var(--h,16px);
    }

    g {
        transform: translate( calc( var(--w) / 2 ) , calc( var(--h) / 2 ) );
    }

    circle {
        transition-property: r;
        transition-duration: 100ms;
    }

    circle:first-child {
        r: calc(var(--w)/2.25);
    }

    :host([picking]) circle:first-child {
        r: calc(var(--w)/1.5);
    }

    :host([picking]) circle:nth-child(2) {
        r: calc(var(--w)/4);
    }

    span:empty{
        display: none;
    }

    #detail:empty{
        display: none;
    }

</style>

<span id="detail">-</span>
<svg>
    <g>
        <circle fill="none" stroke="currentColor" />
        <circle r="0" fill="currentColor" />
    </g>
</svg>
`;

let t;
let boundPickerHandler;
let boundEscapeHandler;

/**
 * @this {InputPicker}
 * @param {PointerEvent} e
 */
function pickerHandler(e) {
    if (e.target instanceof this.pickerType) {
        const res = this.pick(e.target);
        if (!res) return;
        this.removeAttribute("picking");
        window.removeEventListener("keydown", boundEscapeHandler);
        window.removeEventListener("pointerdown", boundPickerHandler);
        document.documentElement.removeAttribute("data-picking");
    }
}

/**
 * @this {InputPicker}
 * @param {KeyboardEvent} e
 */
function escapeHandler(e) {
    if (e.key == "Escape") {
        this.removeAttribute("picking");
        window.removeEventListener("keydown", boundEscapeHandler);
        window.removeEventListener("pointerdown", boundPickerHandler);
        document.documentElement.removeAttribute("data-picking");
    }
}

export class InputPicker extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += pickerTemplate;

        /**@private */
        this._pickerType = null;

        /**@private */
        this._pickedElement = null;

        /**@private */
        this._rejectList = null;

        /**
         * @private
         * @template {HTMLElement} T
         * @type {(target: T, picker: InputPicker) => void}
         */
        this._pickCallback = () => null;

        this.onpointerdown = (e) => {
            if (this.hasAttribute("picking")) {
                this.removeAttribute("picking");
                return;
            }

            this.toggleAttribute("picking", true);

            if (boundPickerHandler) {
                window.removeEventListener("pointerdown", boundPickerHandler);
                window.removeEventListener("keydown", boundEscapeHandler);
                this != t && t.removeAttribute("picking");
            }

            document.documentElement.setAttribute(
                "data-picking",
                this._pickerType.name
            );

            setTimeout(() => {
                t = this;
                window.addEventListener(
                    "pointerdown",
                    (boundPickerHandler = pickerHandler.bind(this))
                );
                window.addEventListener(
                    "keydown",
                    (boundEscapeHandler = escapeHandler.bind(this))
                );
            }, 0);
        };
    }

    /**
     * @template {HTMLElement} T
     * @param {{type: new (...args: any[]) => T, fn: (target: T, picker: InputPicker) => any}} o
     */
    setPickerType({ type, fn }) {
        this._pickerType = type;
        this._pickCallback = fn;
    }

    pick(target) {
        // console.log(target, this._rejectList[0]());
        // console.log(target == this._rejectList[0]());
        if (this._rejectList.some((el) => el() == target)) return;
        this._pickedElement = target;
        // this._pickCallback(target, this);
        this.dispatchEvent(new Event("change", { bubbles: true }));
        document.documentElement.removeAttribute("data-picking");
        return true;
    }

    /**@param {()=>HTMLElement[]} arr */
    set rejectList(arr) {
        this._rejectList = arr;
    }

    get pickerType() {
        return this._pickerType;
    }

    get value() {
        if (!this._pickedElement) return;
        return this._pickCallback(this._pickedElement, this);
    }

    get normValue() {
        return this.value;
    }
}
