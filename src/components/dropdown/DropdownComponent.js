import { products } from "../../display/config.js";

class DropdownComponent extends HTMLElement {
    constructor() {
        super();

        this._options = [];

        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.innerHTML = `
            position: absolute;
            bottom: 50%;
            right: 50%;
            width: 500px;
            `

        this.select = document.createElement("select");
        this.select.setAttribute("id", "product-selection");

        this.select.addEventListener('change', () => {
            this._emitProductSelected();
        });

        shadow.appendChild(style);
        shadow.append(this.select);

        // Populate options
        this.options = Object.keys(products);
    }

    connectedCallback() {
        if (this.select.value) {
            this._emitProductSelected();
        }
    }

    _emitProductSelected() {
        this.dispatchEvent(new CustomEvent('product-selected', {
            detail: { product: this.select.value },
            bubbles: true,
            composed: true
        }));
    }

    get value() {
        return this.select.value;
    }

    set value(val) {
        this.select.value = val;
    }

    set options(items) {
        this._options = items;
        this._renderOptions();
    }

    get options() {
        return this._options;
    }

    _renderOptions() {
        this.select.innerHTML = '';
        this._options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            this.select.appendChild(opt);
        });
    }
}
customElements.define('product-selector', DropdownComponent);