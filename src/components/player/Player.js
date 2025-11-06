import './PlayPause.js';
import './Slider.js';

class Player extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        shadow.innerHTML = `
            <play-pause></play-pause>
            <slider-component></slider-component>
        `;

        const style = document.createElement('style');
        style.textContent = `
           :host {
                position: absolute;
                bottom: 5%;
                left: 50%;
                transform: translateX(-50%);
                
                display: flex;
                align-items: center;
            }
        `;

        shadow.append(style);
    }
}
customElements.define('player-component', Player);