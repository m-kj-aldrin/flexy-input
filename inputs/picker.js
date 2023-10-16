import { Base } from "./base.js";

const pickerTemplate = `
<style>
    :host {
        border: 1px currentColor solid;
        width: max-content;
        cursor: pointer;

        display: flex;
        flex-direction: column;
        align-items: center;
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

</style>

<svg>
    <g>
        <circle fill="none" stroke="currentColor" />
        <circle r="0" fill="currentColor" />
    </g>
</svg>
`;

let boundPickerHandler;
let boundEscapeHandler;

/**
 * @this {InputPicker}
 * @param {PointerEvent} e
 */
function pickerHandler(e) {
    if (e.target instanceof this.pickerType) {
        this.pick(e.target);
        this.removeAttribute("picking");
        window.removeEventListener("keydown", boundEscapeHandler);
        window.removeEventListener("pointerdown", boundPickerHandler);
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

            window.addEventListener(
                "keydown",
                (boundEscapeHandler = escapeHandler.bind(this))
            );

            window.addEventListener(
                "pointerdown",
                (boundPickerHandler = pickerHandler.bind(this))
            );
        };
    }

    /**
     * @template {HTMLElement} T
     * @param {{type: new (...args: any[]) => T, fn: (target: T, picker: InputPicker) => void}} o
     */
    setPickerType({ type, fn }) {
        this._pickerType = type;
        this._pickCallback = fn;
    }

    pick(target) {
        this._pickedElement = target;
        this._pickCallback(target, this);
        this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    get pickerType() {
        return this._pickerType;
    }

    get value() {
        return this._pickedElement;
    }

    get normValue() {
        return this.value;
    }
}
