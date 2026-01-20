import { MercatorOverlay } from '../display/customOverlay.js';
import { RasterGenerator } from '../display/rasterGenerator.js';
import { updateLegend, hideLegend } from '../components/legend/legend.js';

// Non-linear colorMap for wind turbine density
// Max pixel value is 480, with small steps at the start
const windTurbineColorMap = [
    { min: -Infinity, max: 1, rgba: [0, 0, 0, 0] },           // Transparent for 0/no data
    { min: 1, max: 5, rgba: [255, 255, 212, 255] },           // Very light yellow
    { min: 5, max: 10, rgba: [254, 227, 145, 255] },          // Light yellow
    { min: 10, max: 20, rgba: [254, 196, 79, 255] },          // Yellow
    { min: 20, max: 35, rgba: [254, 153, 41, 255] },          // Light orange
    { min: 35, max: 50, rgba: [236, 112, 20, 255] },          // Orange
    { min: 50, max: 75, rgba: [204, 76, 2, 255] },            // Dark orange
    { min: 75, max: 100, rgba: [153, 52, 4, 255] },           // Brown-orange
    { min: 100, max: 150, rgba: [102, 37, 6, 255] },          // Dark brown
    { min: 150, max: 250, rgba: [80, 25, 15, 255] },          // Darker brown
    { min: 250, max: 480, rgba: [50, 10, 10, 255] },          // Very dark
    { min: 480, max: Infinity, rgba: [30, 0, 0, 255] },       // Near black
];

// Thresholds for legend display
const windTurbineThresholds = [1, 5, 10, 20, 35, 50, 75, 100, 150, 250, 480];

class WindTurbinesLayer {
    constructor() {
        this.overlay = null;
        this.map = null;
        this.data = null;
        this.bounds = null;
        this.cols = 0;
        this.rows = 0;
        this.isVisible = false;
        this.opacity = 1;
        this.imageUrl = null;
    }

    async loadData() {
        if (this.data) return; // Already loaded

        const response = await fetch('wind_turbines.json');
        const json = await response.json();

        // Decode base64 and decompress gzip
        const binaryString = atob(json.data);
        const compressedBytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));

        const ds = new DecompressionStream('gzip');
        const decompressedStream = new Response(compressedBytes).body.pipeThrough(ds);
        const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();

        // Parse as uint16
        this.data = new Uint16Array(decompressedBuffer);
        this.cols = json.cols;
        this.rows = json.rows;
        this.bounds = new google.maps.LatLngBounds(
            { lat: json.bounds.ymin, lng: json.bounds.xmin },
            { lat: json.bounds.ymax, lng: json.bounds.xmax }
        );
    }

    async generateImage() {
        if (!this.data) await this.loadData();

        const generator = new RasterGenerator(
            this.data,
            this.cols,
            this.rows,
            windTurbineColorMap
        );

        this.imageUrl = await generator.generateUrl();
        return this.imageUrl;
    }

    async setMap(map) {
        if (map === null) {
            // Hide layer
            if (this.overlay) {
                this.overlay.setMap(null);
            }
            this.isVisible = false;
            this.map = null;
            hideLegend();
            return;
        }

        // Show layer
        this.map = map;
        this.isVisible = true;

        if (!this.imageUrl) {
            await this.generateImage();
        }

        if (this.overlay) {
            this.overlay.setMap(map);
        } else {
            this.overlay = new MercatorOverlay(
                this.imageUrl,
                this.bounds,
                map,
                false,
                'overlayMouseTarget',
                this.cols,
                this.rows
            );
        }

        this.overlay.setOpacity(this.opacity);

        // Show legend
        updateLegend(windTurbineColorMap, windTurbineThresholds, 'Wind Turbine Density', false);
    }

    setOpacity(opacity) {
        this.opacity = opacity;
        if (this.overlay) {
            this.overlay.setOpacity(opacity);
        }
    }

    getValue(gridX, gridY) {
        if (!this.data || gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
            return null;
        }
        const index = gridY * this.cols + gridX;
        const value = this.data[index];
        return value === 0 ? null : value;
    }
}

const windTurbinesLayer = new WindTurbinesLayer();

// Handle click events on the overlay
document.addEventListener('overlay-click', (event) => {
    if (!windTurbinesLayer.isVisible || !windTurbinesLayer.data) return;

    const { gridX, gridY, lat, lng } = event.detail;
    const value = windTurbinesLayer.getValue(gridX, gridY);
    const gridIndex = gridY * windTurbinesLayer.cols + gridX;

    // Use the existing tooltip system via product-readout-result event
    document.dispatchEvent(new CustomEvent('product-readout-result', {
        detail: { gridIndex, lat, lng, value, units: 'turbines' }
    }));
});

document.addEventListener('map-ready', () => {
    const layerItemElement = document.querySelector('[data-layer="wind-turbines"]');
    if (!layerItemElement) return;

    const toggle = layerItemElement.querySelector('.toggle-switch input');
    const slider = layerItemElement.querySelector('input[type="range"]');
    const opacityLabel = layerItemElement.querySelector('#wind-turbines-opacity-label');

    toggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            await windTurbinesLayer.setMap(map);
        } else {
            windTurbinesLayer.setMap(null);
        }
    });

    slider.addEventListener('change', (e) => {
        const newOpacity = e.target.value;
        windTurbinesLayer.setOpacity(newOpacity / 100);
        opacityLabel.textContent = newOpacity + "%";
    });
});

export { windTurbinesLayer, windTurbineColorMap, windTurbineThresholds };
