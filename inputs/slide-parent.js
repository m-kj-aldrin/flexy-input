import { Base } from "./base.js";
import { InputNumber } from "./number.js";

const slideTemplate = `
<slot></slot>
`;

/**
 * @this {SlideParent}
 * @param {PointerEvent} e
 */
function pointerDown(e) {
    if (!e.shiftKey) return;

    this._child = this.querySelector("input-number");
    if (!this._child) return;

    this.setPointerCapture(e.pointerId);
    this.onpointermove = pointerMove.bind(this);
}

/**
 * @this {SlideParent}
 * @param {PointerEvent} e
 */
function pointerMove(e) {
    document.documentElement.setAttribute("data-cursor", "slide");
    const mx = e.movementX;
    this._child.value += mx;
}

/**
 * @this {SlideParent}
 * @param {PointerEvent} e
 */
function pointerUp(e) {
    this.releasePointerCapture(e.pointerId);
    this.onpointermove = null;

    document.documentElement.removeAttribute("data-cursor");
}

export class SlideParent extends Base {
    constructor() {
        super();

        /**@type {InputNumber} */
        this._child = null;

        this.shadowRoot.innerHTML += slideTemplate;

        this.onpointerdown = pointerDown.bind(this);
        this.onpointerup = pointerUp.bind(this);
    }
}
