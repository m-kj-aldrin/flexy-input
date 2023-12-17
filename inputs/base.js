// const baseTemplateStyle = `
// <style>
//     :focus {
//         outline: none;
//     }
// </style>
// `;

export class Base extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        // this.shadowRoot.innerHTML += baseTemplateStyle;
    }
}
