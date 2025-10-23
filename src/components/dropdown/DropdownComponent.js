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

        // Listen to internal change event and re-emit it
        this.select.addEventListener('change', () => {
            this.dispatchEvent(new Event('change'));
        });

        shadow.appendChild(style);
        shadow.append(this.select);
    }

    get value() {
        return this.select.value;
    }

    set value(val) {
        this.select.value = val;
    }

    // Set options
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