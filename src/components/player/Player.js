import './PlayPause.js';
import './Slider.js';

class Player extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});

        this.shadow.innerHTML = `
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
                gap: 10px;
                background: rgba(255, 255, 255, 0.9);
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
        `;

        this.shadow.append(style);
    }

    get slider() {
        return this.shadow.querySelector('slider-component');
    }

    get playPause() {
        return this.shadow.querySelector('play-pause');
    }

    setTotalFiles(total) {
        this.slider.setRange(0, Math.max(0, total - 1));
    }

    setCurrentIndex(index) {
        this.slider.setValue(index);
    }
}

customElements.define('player-component', Player);