class Slider extends HTMLElement {
    constructor() {
        super();

        this.shadow = this.attachShadow({mode: 'open'});

        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.value = '0';
        this.slider.min = '0';
        this.slider.max = '5';

        const style = document.createElement('style');
        style.textContent = `
        input[type="range"] {
            width: 100ch;
            accent-color: black;
        }
        input[type="range"]:hover {
            cursor: pointer;
        }
        `;

        this.shadow.appendChild(style);
        this.shadow.appendChild(this.slider);
    }

    connectedCallback() {

    }

    setRange(min, max) {
        this.slider.min = min;
        this.slider.max = max;
        this.slider.value = min;
    }
}
customElements.define('slider-component', Slider);