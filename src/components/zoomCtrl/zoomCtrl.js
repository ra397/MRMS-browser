import "./zoomCtrl.css";

export class ZoomCtrl {
    static #CSS_ID = 'ZoomCtrlCss';
    static #CONT_ID = 'map_zoom_ctrl';
    static #SVG_NS = 'http://www.w3.org/2000/svg';
    static #SVG_EL = {
        class: 'svg-bar',
        width: '1',
        height: '2',
        viewBox: '0 0 1 2',
        preserveAspectRatio: 'none',
        'vector-effect': 'non-scaling-stroke'
    };
    static #SVG_POLY = {
        points: '.02,.02 .98,.02 .22,1.98 .02,1.98',
        fill: 'inherit',
        stroke: 'inherit',
        "stroke-width": 'inherit'
    };

    #zoomButtons = [];
    #zoomIndicator;
    #container;
    #timeout = null;

    constructor(container, {map= null,  minZoom = 4, maxZoom = 12, initialZoom = 5 } = {}) {
        this.#container = container;
        if (this.#container.id !== ZoomCtrl.#CONT_ID) this.#container.id = ZoomCtrl.#CONT_ID;

        this.map = map;
        this.minZoom = minZoom ?? map.get('minZoom');
        this.maxZoom = maxZoom ?? map.get('maxZoom');
        this.zoom = initialZoom ?? map.getZoom();

        this.#createCtrl();
        this.#attachEvents();
        this.#updateBar();
    }

    #createCtrl() {
        this.#container.innerHTML = '';
        const value = getComputedStyle(this.#container).getPropertyValue('--barPrcnt');
        if (!value)  injectCSS(zoomCtrlCss, ZoomCtrl.#CSS_ID);

        // Create zoom buttons
        this.#zoomButtons = [
            { tag: 'div', attribute: { class: 'zoom', 'data-value': '1' }, inner: ['innerText', '+'] },
            { tag: 'div', attribute: { class: 'zoom', 'data-value': '-1' }, inner: ['innerHTML', '&ndash;'] }
        ].map(item => {
            const el = document.createElement(item.tag);
            Object.entries(item.attribute).forEach(([k, v]) => el.setAttribute(k, v));
            el[item.inner[0]] = item.inner[1];
            this.#container.appendChild(el);
            return el;
        });

        // Create zoom indicator
        this.#zoomIndicator = document.createElement('div');
        this.#zoomIndicator.className = 'zoom-ind';

        const createSvg = (className = null) => {
            const svg = document.createElementNS(ZoomCtrl.#SVG_NS, 'svg');
            Object.entries(ZoomCtrl.#SVG_EL).forEach(([k, v]) => svg.setAttribute(k, v));

            const poly = document.createElementNS(ZoomCtrl.#SVG_NS, 'polygon');
            Object.entries(ZoomCtrl.#SVG_POLY).forEach(([k, v]) => poly.setAttribute(k, v));
            svg.appendChild(poly);

            if (className) svg.classList.add(className);
            return svg;
        };

        this.#zoomIndicator.appendChild(createSvg());
        this.#zoomIndicator.appendChild(createSvg('bar-cover'));
        this.#container.appendChild(this.#zoomIndicator);
    }

    #attachEvents() {
        this.#zoomIndicator.addEventListener('click', this.#onBarClick.bind(this));
        this.#zoomButtons.forEach(btn => {
            btn.addEventListener('click', this.#onZoomClick.bind(this));
        });
    }

    #onZoomClick(ev) {
        ev.preventDefault();
        const val = parseInt(ev.currentTarget.dataset.value);
        const newZoom = Math.min(
            this.maxZoom,
            Math.max(
                this.minZoom,
                val + this.zoom
            ),
        );

        this.map?.setZoom(newZoom);
        this.setZoom(newZoom);
    }

    #onBarClick(ev) {
        ev.preventDefault();
        const rect = this.#zoomIndicator.getBoundingClientRect();
        const relativeY = ev.clientY - rect.top;
        const height = rect.height;
        const percent = 1 - relativeY / height;
        const newZoom = this.minZoom + Math.round((this.maxZoom - this.minZoom) * percent);
        this.map?.setZoom(newZoom);
        this.setZoom(newZoom);
    }

    setMap (use_map=null) {
        this.map = use_map;
        this.minZoom = this.map.get('minZoom') ? this.map.get('minZoom') : this.minZoom;
        this.map.set('minZoom', this.minZoom)

        this.maxZoom = this.map.get('maxZoom') ? this.map.get('maxZoom') : this.maxZoom;
        this.map.set('maxZoom', this.maxZoom)

        this.zoom = this.map.getZoom() ? this.map.getZoom() : this.zoom;
        this.#updateBar(this.map.get('minZoom'))
        google.maps.event.addListener(
            this.map,
            'zoom_changed',
            () => {
                this.zoom = this.map.getZoom();
                if (!this.#timeout) clearTimeout(this.#timeout);
                this.#zoomIndicator.classList.add('visible');
                setTimeout(() => this.#zoomIndicator.classList.remove('visible'), 1300);
            }
        )
    }
    setZoom(value) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, value));
        this.#updateBar();
    }
    #updateBar() {
        const percent = Math.round(100 * (this.zoom - this.minZoom) / (this.maxZoom - this.minZoom));
        this.#container.style.setProperty('--barPrcnt', `${percent}%`);
    }
    getZoom = () => this.zoom;
}

globalThis.ZoomCtrl = ZoomCtrl;
function injectCSS (cssText, id = 'ZoomCtrlCss')  {
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = cssText;
        document.head.appendChild(style);
    } else {
        console.log('CSS already injected.');
    }
}

const zoomCtrlCss = `#map_zoom_ctrl {
    --width: 1em;
    --height: 1em;
    --stroke: 2px;
    --barPrcnt: 0%;    
    border : 1px solid #ccc;
    position: absolute;
    width: var(--width);
    height: calc(var(--height) * 2);
    font-size: 1.75rem;
    line-height: var(--height);
    text-align: center;
    user-select: none;
}
#map_zoom_ctrl .zoom {
    background-color : white;
    width : var(--width);
    height : var(--height);
}

#map_zoom_ctrl .zoom:hover  {
    background-color: gold;
    outline: var(--stroke) solid #fff;
    outline-offset: calc(-1 * var(--stroke));
    cursor: pointer;    
}
#map_zoom_ctrl .zoom-ind {
    position : absolute;
    visibility: hidden;
    width : calc(var(--width) * 0.7);
    height : calc(var(--height) * 2);
    top: 0; /* (--height) * 2; */
    left: calc( var(--width) + 0.2 * var(--width));
    opacity: 0;
    scale: 0;
    stroke: white;
    stroke-width: 0.03;
    filter: drop-shadow(1px 1px 1.5px rgba(128, 128, 128, .6));
    
    transition-property: opacity, scale, visibility;
    transition-duration: 1s, .0s, 0s;
    transition-delay:   .23s, 1.23s, 1.23s;
    transition-timing-function: ease-out;
    transition-behavior: allow-discrete;        
}

#map_zoom_ctrl > .zoom:hover ~ .zoom-ind,
#map_zoom_ctrl > .zoom-ind:hover,
#map_zoom_ctrl > .zoom-ind.visible {
    visibility: visible;
    opacity: 1;
    scale: 1;
    transition-property: opacity, scale, visibility;
    transition-duration: .23s, .0s, 0s;
    transition-delay:   .0s;
    transition-timing-function: ease-in;
    transition-behavior: allow-discrete;
}

.zoom-ind.visible {
     transition: none !important;
} 

.zoom-ind > svg.svg-bar {
    position : absolute;
    top : 0;
    left : 0;
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    fill: #74c2ff
}


.zoom-ind > svg.bar-cover {
    fill: rgba(0, 0, 0, 0.52);
    clip-path: polygon(0% calc(100% - var(--barPrcnt)), 100% calc(100% - var(--barPrcnt)), 100% 100%, 0 100%);
}`;