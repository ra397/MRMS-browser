// Singleton store for raw decoded file data
// Files stored here are never re-fetched during the session

import { products, overlayInfo } from '../display/config.js';
import { tooltipManager } from '../display/tooltipManager.js';
import { unitSystem } from '../utils/unitConversion.js';

const files = new Map(); // Map<fileName, { data, productName, referenceValue, binaryScale, decimalScale }>
let activeFiles = [];    // Currently active file list for playback (ordered)
let currentFilename = null; // Track current frame for unit system changes

const NUM_COLS = overlayInfo.numCols;
const NUM_ROWS = overlayInfo.numRows;

function convertScaledToReal(scaledValue, referenceValue, binaryScale, decimalScale) {
    if (scaledValue === undefined || scaledValue === null) {
        return null;
    }
    const binaryFactor = Math.pow(2, binaryScale);
    const decimalFactor = Math.pow(10, decimalScale);
    return ((scaledValue * binaryFactor) + referenceValue) / decimalFactor;
}

function getUnitsForProduct(productName) {
    const product = products.find(p => p.s3_name === productName);
    return product?.units || '';
}

export const dataStore = {
    has(fileName) {
        return files.has(fileName);
    },

    get(fileName) {
        return files.get(fileName);
    },

    set(fileName, { data, productName, referenceValue, binaryScale, decimalScale }) {
        files.set(fileName, { data, productName, referenceValue, binaryScale, decimalScale });
    },

    setActiveFiles(fileNames) {
        activeFiles = [...fileNames];
    },

    getActiveFiles() {
        return activeFiles;
    },

    getActiveFile(index) {
        return activeFiles[index];
    },

    getActiveFileCount() {
        return activeFiles.length;
    },

    // Clear everything (e.g., on product change)
    clear() {
        files.clear();
        activeFiles = [];
    },

    // Clear only the active list, keep cached data
    clearActiveFiles() {
        activeFiles = [];
    },
};

// Handle product readout request from overlay click
document.addEventListener('product-readout-request', event => {
    const { gridX, gridY, lat, lng, filename } = event.detail;

    // Bounds check
    if (gridX < 0 || gridX >= NUM_COLS || gridY < 0 || gridY >= NUM_ROWS) {
        return;
    }

    const gridIndex = gridY * NUM_COLS + gridX;
    const fileData = files.get(filename);

    if (!fileData) {
        return;
    }

    const { data, productName, referenceValue, binaryScale, decimalScale } = fileData;
    const scaledValue = data[gridIndex];
    const metricValue = convertScaledToReal(scaledValue, referenceValue, binaryScale, decimalScale);
    const metricUnits = getUnitsForProduct(productName);

    // Convert value and units based on current unit system
    const value = unitSystem.convertValue(metricValue, metricUnits);
    const units = unitSystem.getDisplayUnit(metricUnits);

    document.dispatchEvent(new CustomEvent('product-readout-result', {
        detail: { gridIndex, lat, lng, value, units }
    }));
});

// Helper to update all open tooltips with current data
function updateOpenTooltips(filename) {
    const openIndices = tooltipManager.getOpenIndices();

    if (openIndices.length === 0) {
        return;
    }

    const fileData = files.get(filename);
    if (!fileData) {
        return;
    }

    const { data, productName, referenceValue, binaryScale, decimalScale } = fileData;
    const metricUnits = getUnitsForProduct(productName);

    // Convert units based on current unit system
    const units = unitSystem.getDisplayUnit(metricUnits);

    const updates = openIndices.map(gridIndex => {
        const scaledValue = data[gridIndex];
        const metricValue = convertScaledToReal(scaledValue, referenceValue, binaryScale, decimalScale);
        // Convert value based on current unit system
        const value = unitSystem.convertValue(metricValue, metricUnits);
        return { gridIndex, value };
    });

    document.dispatchEvent(new CustomEvent('product-readout-update', {
        detail: { updates, units }
    }));
}

// Handle frame change - update all open tooltips
document.addEventListener('frame-changed', event => {
    const { filename } = event.detail;
    currentFilename = filename;
    updateOpenTooltips(filename);
});

// Handle unit system change - update all open tooltips with new units
document.addEventListener('unit-system-changed', () => {
    if (currentFilename) {
        updateOpenTooltips(currentFilename);
    }
});