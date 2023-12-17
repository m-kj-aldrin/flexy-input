import { Base } from "../base.js";
import numberTemplate from "./number.component.html?inline";

const digitRE = new RegExp(/\d/);
const leftRightRE = new RegExp(/ArrowLeft|ArrowRight|Tab/);
const upDownRE = new RegExp(/ArrowUp|ArrowDown/);

/**
 * @this {InputNumber}
 * @param {KeyboardEvent} e
 */
function keyDown(e) {
    if (e.key == "a" && (e.ctrlKey || e.metaKey)) {
        return;
    }

    if (leftRightRE.test(e.key)) {
        return;
    }

    e.preventDefault();

    if (upDownRE.test(e.key)) {
        let prevVal = this.value;
        if (e.key == "ArrowUp") {
            this.value = Math.min(this.value + 1, this._max);
        }
        if (e.key == "ArrowDown") {
            this.value = Math.max(this.value - 1, this._min);
        }
        if (prevVal != this.value) {
            this.dispatchEvent(new InputEvent("input", { bubbles: true }));
            this.dispatchEvent(new InputEvent("change", { bubbles: true }));
        }
    }

    if (digitRE.test(e.key)) {
        let ss = e.target.selectionStart;
        let se = e.target.selectionEnd;

        let currentValue = this.value || "";

        let s = `${currentValue}${e.key}`;
        if (se - ss) {
            let m = `${currentValue}`.slice(0, ss);
            let n = `${e.key}`;
            let o = `${currentValue}`.slice(se);
            s = `${m}${n}${o}`;
        }

        this.value = +s;
    }

    if (e.key == "Backspace") {
        let ss = e.target.selectionStart;
        let se = e.target.selectionEnd;

        let newString = this.value?.toString() || "";

        if (se - ss) {
            let start = newString.slice(0, ss);
            let end = newString.slice(se);
            newString = start + end;
        } else {
            let start = newString.slice(0, ss - 1);
            let end = newString.slice(ss);
            newString = start + end;
        }

        if (!newString) {
            this.clear();
        } else {
            this.value = +newString;
        }
    }

    if (e.key == "Enter") {
        if (this._changed) {
            this.dispatchEvent(new InputEvent("change", { bubbles: true }));
        }
    }
}

export class InputNumber extends Base {
    constructor() {
        super();

        this.shadowRoot.innerHTML += numberTemplate;

        this._min = Number.NEGATIVE_INFINITY;
        this._max = Number.POSITIVE_INFINITY;

        /**@private */
        this._changed = false;

        /**@private */
        this.input = document.createElement("input");
        this.input.type = "text";
        this.shadowRoot.appendChild(this.input);

        this.input.onkeydown = keyDown.bind(this);

        this.onchange = (e) => {
            this.value = Math.min(Math.max(this.value, this._min), this._max);
            this._changed = false;
        };

        this.input.onblur = (e) => {
            if (this._changed) {
                this.dispatchEvent(new InputEvent("change", { bubbles: true }));
            }
        };
    }

    updateWidth() {
        this.input.style.setProperty("--n", this.input.value.length.toString());
    }

    clear() {
        this.input.value = "";
        this.updateWidth();
        this._changed = false;
    }

    /**@param {number} v */
    set value(v) {
        const input = this.input;
        let newValue = v;

        if (newValue != this.value) {
            this._changed = true;
        }

        input.value = newValue.toString();
        this.updateWidth();
    }

    get value() {
        let value = parseInt(this.input.value);
        if (isNaN(value)) {
            return null;
        }
        return value;
    }

    /**@param {{min:number,max:number}} o */
    set minmax({ min, max }) {
        isNaN(min) || (this._min = min);
        isNaN(max) || (this._max = max);
        this.value = this._min;
    }

    get range() {
        const r = this._max - this._min;
        if (!r || r == Infinity) return 1;
        return this._max - this._min;
    }

    get normValue() {
        let min = this._min == Number.NEGATIVE_INFINITY ? 0 : this._min;
        return (this.value - min) / this.range;
    }
}
