class PlayPause extends HTMLElement {
    constructor() {
        super();

        this.shadow = this.attachShadow({mode: 'open'});

        const playSVG = `
        <svg height="100%" width="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,0 0,100 75,50 0,0" fill="black"/>
        </svg>
        `;

        const pauseSVG = `
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="10" width="20" height="80" fill="black"/> 
            <rect x="60" y="10" width="20" height="80" fill="black" /> 
        </svg>
        `;

        const button = document.createElement('span');
        button.setAttribute('id', 'play-pause-button');
        button.innerHTML = playSVG;

        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: flex;
                width: 25px;
                height: 25px;
            }
            #play-pause-button:hover {
                cursor: pointer;
            }
        `;

        this.shadow.appendChild(style);
        this.shadow.appendChild(button);
    }

    connectedCallback() {

    }
}
customElements.define('play-pause', PlayPause);