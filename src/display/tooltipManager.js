// Tooltip manager for product readout
// Tracks open tooltips and updates them on frame changes

class TooltipOverlay extends google.maps.OverlayView {
    #position;
    #content;
    #div;
    #onClose;

    constructor(position, content, map, onClose) {
        super();
        this.#position = position;
        this.#content = content;
        this.#div = null;
        this.#onClose = onClose;
        this.setMap(map);
    }

    onAdd() {
        this.#div = document.createElement('div');
        this.#div.className = 'product-tooltip';

        const content = document.createElement('span');
        content.className = 'product-tooltip-content';
        content.textContent = this.#content;

        const closeBtn = document.createElement('span');
        closeBtn.className = 'product-tooltip-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.#onClose?.());

        this.#div.appendChild(content);
        this.#div.appendChild(closeBtn);
        this.getPanes().floatPane.appendChild(this.#div);
    }

    draw() {
        const projection = this.getProjection();
        if (!projection || !this.#div) return;

        const pos = projection.fromLatLngToDivPixel(this.#position);
        this.#div.style.left = `${pos.x}px`;
        this.#div.style.top = `${pos.y}px`;
    }

    onRemove() {
        if (this.#div?.parentNode) {
            this.#div.parentNode.removeChild(this.#div);
            this.#div = null;
        }
    }

    setContent(content) {
        this.#content = content;
        if (this.#div) {
            const contentEl = this.#div.querySelector('.product-tooltip-content');
            if (contentEl) contentEl.textContent = content;
        }
    }

    destroy() {
        this.setMap(null);
    }
}

// Inject tooltip CSS
const style = document.createElement('style');
style.textContent = `
    .product-tooltip {
        position: absolute;
        transform: translate(-50%, -100%) translateY(-8px);
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .product-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: white;
    }
    .product-tooltip::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 7px solid transparent;
        border-top-color: #ccc;
    }
    .product-tooltip-close {
        cursor: pointer;
        color: #999;
        font-size: 14px;
        line-height: 1;
    }
    .product-tooltip-close:hover {
        color: #333;
    }
`;
document.head.appendChild(style);

const openTooltips = new Map(); // Map<gridIndex, { overlay, lat, lng }>

function formatValue(value, units) {
    if (value === null) {
        return 'No Data';
    }
    const rounded = Math.round(value * 100) / 100;
    return `${rounded} ${units}`;
}

export const tooltipManager = {
    getOpenIndices() {
        return Array.from(openTooltips.keys());
    },

    hasTooltip(gridIndex) {
        return openTooltips.has(gridIndex);
    },

    createTooltip(gridIndex, lat, lng, value, units) {
        const position = new google.maps.LatLng(lat, lng);
        const onClose = () => this.destroyTooltip(gridIndex);
        const overlay = new TooltipOverlay(position, formatValue(value, units), globalThis.map, onClose);
        openTooltips.set(gridIndex, { overlay, lat, lng });
    },

    destroyTooltip(gridIndex) {
        const tooltip = openTooltips.get(gridIndex);
        if (tooltip) {
            tooltip.overlay.destroy();
            openTooltips.delete(gridIndex);
        }
    },

    updateTooltip(gridIndex, value, units) {
        const tooltip = openTooltips.get(gridIndex);
        if (tooltip) {
            tooltip.overlay.setContent(formatValue(value, units));
        }
    },

    clearAll() {
        openTooltips.forEach(tooltip => tooltip.overlay.destroy());
        openTooltips.clear();
    }
};

// Handle product readout result - create or destroy tooltip
document.addEventListener('product-readout-result', event => {
    const { gridIndex, lat, lng, value, units } = event.detail;

    if (tooltipManager.hasTooltip(gridIndex)) {
        tooltipManager.destroyTooltip(gridIndex);
    } else {
        tooltipManager.createTooltip(gridIndex, lat, lng, value, units);
    }
});

// Handle frame change updates - update all open tooltips
document.addEventListener('product-readout-update', event => {
    const { updates, units } = event.detail;

    updates.forEach(({ gridIndex, value }) => {
        tooltipManager.updateTooltip(gridIndex, value, units);
    });
});
