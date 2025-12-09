class Sidebar extends HTMLElement {
    constructor() {
        super();

        this.shadowRoot = this.attachShadow({mode: 'open'});

        const style = document.createElement('style');
        style.textContent = `
        
        
        `;

        this.shadowRoot.appendChild(style);
    }

    connectedCallback() {

    }

    disconnectedCallback() {

    }
}
customElements.define('navigation-sidebar', Sidebar);