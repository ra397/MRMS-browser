import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";
import { overlayInfo, products } from "./config.js";
import { getActiveColorMap } from "./colorMapUtils.js";
import { setSliderRange, setSliderValue } from "../components/player/player.js";
import { updateLegend } from '../components/legend/legend.js';
import { dataStore } from '../store/dataStore.js';
import { visualizationState } from '../store/visualizationState.js';
import { imageCache } from '../store/imageCache.js';

let overlay;
let currentIndex = 0;
let isPlaying = false;
let playInterval = null;

// UI Elements
const colorCountInput = document.getElementById("mrms-color-count");
const rangeMinSlider = document.getElementById("mrms-min");
const rangeMaxSlider = document.getElementById("mrms-max");
const rangeValueLabel = document.getElementById("mrms-range-value-label");
const paletteRadioButtons = document.querySelectorAll('input[name="palette"]');

// Initialize overlay
document.addEventListener("DOMContentLoaded", () => {
    overlay = customOverlay(overlayInfo.transparentImgSrc, overlayInfo.bbox, map, 'OverlayView', false);
});

// --- Helper Functions ---

function setSelectedPalette(paletteName) {
    paletteRadioButtons.forEach(radio => {
        radio.checked = radio.value === paletteName;
    });
}

function initializeRangeSliders(product) {
    const productMin = product.thresholds[0];
    const productMax = product.thresholds[product.thresholds.length - 1];
    const range = productMax - productMin;
    const step = range / 100;

    rangeMinSlider.min = productMin;
    rangeMinSlider.max = productMax;
    rangeMinSlider.step = step;
    rangeMinSlider.value = productMin;

    rangeMaxSlider.min = productMin;
    rangeMaxSlider.max = productMax;
    rangeMaxSlider.step = step;
    rangeMaxSlider.value = productMax;

    rangeValueLabel.textContent = `${productMin} - ${productMax}`;
}

function scaleColorMap(colorMap, referenceValue, binaryScale, decimalScale) {
    const decimalFactor = Math.pow(10, decimalScale);
    const binaryFactor = Math.pow(2, binaryScale);

    return colorMap.map(entry => ({
        min: entry.min === -Infinity ? -Infinity : (entry.min * decimalFactor - referenceValue) / binaryFactor,
        max: entry.max === Infinity ? Infinity : (entry.max * decimalFactor - referenceValue) / binaryFactor,
        rgba: entry.rgba,
    }));
}

async function generateImageUrl(fileData) {
    const { data, productName, referenceValue, binaryScale, decimalScale } = fileData;
    const product = products.find(p => p.s3_name === productName);

    const colorMap = getActiveColorMap(
        product,
        visualizationState.getPalette(),
        visualizationState.getColorCount(),
        visualizationState.getRangeMin(),
        visualizationState.getRangeMax(),
        visualizationState.getCustomColors()
    );

    const scaledColorMap = scaleColorMap(colorMap, referenceValue, binaryScale, decimalScale);
    const raster = new RasterGenerator(data, overlayInfo.numCols, overlayInfo.numRows, scaledColorMap);
    return await raster.generateUrl();
}

function updateLegendFromProduct(product) {
    const colorMap = getActiveColorMap(
        product,
        visualizationState.getPalette(),
        visualizationState.getColorCount(),
        visualizationState.getRangeMin(),
        visualizationState.getRangeMax(),
        visualizationState.getCustomColors()
    );

    if (visualizationState.getColorCount() === null) {
        colorCountInput.value = colorMap.length - 2;
    }

    const thresholds = colorMap.slice(1, -1).map(entry => entry.min);
    thresholds.push(colorMap[colorMap.length - 2].max);
    updateLegend(colorMap, thresholds, product.units, visualizationState.isDefault());
}

async function getOrGenerateImage(fileName) {
    const vizKey = visualizationState.getCacheKey();

    if (imageCache.has(fileName, vizKey)) {
        return imageCache.get(fileName, vizKey);
    }

    const fileData = dataStore.get(fileName);
    if (!fileData) return null;

    const imageUrl = await generateImageUrl(fileData);
    imageCache.set(fileName, vizKey, imageUrl);
    return imageUrl;
}

function displayFrame(index) {
    const activeFiles = dataStore.getActiveFiles();
    if (index < 0 || index >= activeFiles.length) return;

    const fileName = activeFiles[index];
    const vizKey = visualizationState.getCacheKey();

    if (imageCache.has(fileName, vizKey)) {
        overlay.setSource(imageCache.get(fileName, vizKey));
        currentIndex = index;
        setSliderValue(index);

        document.dispatchEvent(new CustomEvent('frame-changed', {
            detail: { filename: fileName }
        }));
    }
}

async function regenerateAndDisplayAll() {
    const activeFiles = dataStore.getActiveFiles();
    if (activeFiles.length === 0) return;

    // Update legend from first file's product
    const firstFileData = dataStore.get(activeFiles[0]);
    if (firstFileData) {
        const product = products.find(p => p.s3_name === firstFileData.productName);
        if (product) {
            updateLegendFromProduct(product);
        }
    }

    // Generate current frame first for immediate feedback
    const currentFileName = activeFiles[currentIndex];
    if (currentFileName) {
        await getOrGenerateImage(currentFileName);
        displayFrame(currentIndex);
    }

    // Generate remaining frames
    for (let i = 0; i < activeFiles.length; i++) {
        if (i === currentIndex) continue; // Already done
        const fileName = activeFiles[i];
        await getOrGenerateImage(fileName);
    }
}

// --- Event Handlers ---

document.addEventListener("display-reset", () => {
    dataStore.clearActiveFiles();
    currentIndex = 0;
    pause();
    overlay.setSource(overlayInfo.transparentImgSrc);
});

document.addEventListener('files-total', event => {
    const { total, fileNames } = event.detail;
    dataStore.setActiveFiles(fileNames);
    setSliderRange(0, total - 1);
});

document.addEventListener('display-file', async event => {
    const { file_name, file_data, product_name, referenceValue, binaryScale, decimalScale } = event.detail;

    // Track current product (resets viz settings if product changed)
    const productChanged = visualizationState.getCurrentProduct() !== product_name;
    visualizationState.setCurrentProduct(product_name);

    // If product changed, update UI to reflect reset state
    if (productChanged) {
        setSelectedPalette('default');
    }

    // Store raw data if not already present
    if (!dataStore.has(file_name)) {
        dataStore.set(file_name, {
            data: file_data,
            productName: product_name,
            referenceValue,
            binaryScale,
            decimalScale,
        });
    }

    // Initialize UI from first file
    const activeFiles = dataStore.getActiveFiles();
    if (activeFiles.length > 0 && file_name === activeFiles[0]) {
        const product = products.find(p => p.s3_name === product_name);
        if (product) {
            if (visualizationState.getRangeMin() === null || visualizationState.getRangeMax() === null) {
                initializeRangeSliders(product);
            }
            updateLegendFromProduct(product);
        }
    }

    // Handle palette fallback
    if (visualizationState.needsPaletteFallback()) {
        visualizationState.setPalette('viridis');
        setSelectedPalette('viridis');
    }

    // Generate image and display
    const imageUrl = await getOrGenerateImage(file_name);

    // Display if this is the first file or current frame
    const fileIndex = activeFiles.indexOf(file_name);
    if (fileIndex === 0 || fileIndex === currentIndex) {
        if (!isPlaying) {
            overlay.setSource(imageUrl);
            currentIndex = fileIndex;
            setSliderValue(fileIndex);

            document.dispatchEvent(new CustomEvent('frame-changed', {
                detail: { filename: file_name }
            }));
        }
    }
});

document.addEventListener("opacity-set", (event) => {
    const opacity = event.detail.opacity / 100;
    overlay.setOpacity(opacity);
});

document.addEventListener("palette-set", async event => {
    visualizationState.setPalette(event.detail.palette);
    await regenerateAndDisplayAll();
});

document.addEventListener("colorcount-set", async event => {
    visualizationState.setColorCount(event.detail.colorCount);

    if (visualizationState.needsPaletteFallback()) {
        visualizationState.setPalette('viridis');
        setSelectedPalette('viridis');
    }

    await regenerateAndDisplayAll();
});

document.addEventListener("range-set", async event => {
    visualizationState.setRange(event.detail.min, event.detail.max);

    if (visualizationState.needsPaletteFallback()) {
        visualizationState.setPalette('viridis');
        setSelectedPalette('viridis');
    }

    await regenerateAndDisplayAll();
});

document.addEventListener("color-edit", async event => {
    const { index, color } = event.detail;
    visualizationState.setCustomColor(index, color);
    await regenerateAndDisplayAll();
});

document.addEventListener("visualization-reset", () => {
    visualizationState.resetToDefaults();
});

// --- Playback Controls ---

function play() {
    if (isPlaying) return;
    isPlaying = true;

    playInterval = setInterval(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= dataStore.getActiveFileCount()) {
            nextIndex = 0;
        }

        const fileName = dataStore.getActiveFile(nextIndex);
        const vizKey = visualizationState.getCacheKey();

        if (imageCache.has(fileName, vizKey)) {
            displayFrame(nextIndex);
        }
    }, 1000);
}

function pause() {
    isPlaying = false;
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
}

document.addEventListener('player-play', () => play());
document.addEventListener('player-pause', () => pause());

document.addEventListener('player-seek', event => {
    displayFrame(event.detail.index);
});

document.addEventListener('player-step', event => {
    const newIndex = currentIndex + event.detail.direction;
    displayFrame(newIndex);
});

document.addEventListener('overlay-click', event => {
    const { gridX, gridY, lat, lng } = event.detail;
    const activeFiles = dataStore.getActiveFiles();
    const filename = activeFiles[currentIndex];

    if (filename) {
        document.dispatchEvent(new CustomEvent('product-readout-request', {
            detail: { gridX, gridY, lat, lng, filename }
        }));
    }
});

export { play, pause, displayFrame };