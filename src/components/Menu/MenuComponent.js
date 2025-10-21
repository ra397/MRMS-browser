import '../ProductSelection/ProductSelectionComponent.js'
import '../Timeline/TimelineComponent.js'

class MenuComponent extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.innerHTML = `
        .container {
            display: grid;
            grid-template-columns: 20ch 1fr;
            padding: 1ch;
        }
        `;

        shadow.innerHTML = `
        <div class="container">
            <span>Select Product:</span>
            <product-selector></product-selector>
            <span>Select Interval:</span>
            <interval-selector></interval-selector>
        </div>
        `;

        shadow.appendChild(style);
    }
}
customElements.define('menu-component', MenuComponent);