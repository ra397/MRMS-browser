import {RasterGenerator} from "./rasterGenerator.js";
import {customOverlay} from "./customOverlay.js";
import {overlayInfo, products} from "./config.js";
import {getActiveColorMap} from "./colorMapUtils.js";
import {setSliderRange, setSliderValue} from "../components/player/player.js";

// Running map of filename -> generated overlay/img
const fileImgMap = new Map();

// Ordered list of filenames for playback
let orderedFileNames = [];
let totalExpectedFiles = 0;
let currentIndex = 0;
let isPlaying = false;
let playInterval = null;

let overlay;
let palette = 'default';
let colorCount = null;
let rangeMin = null;
let rangeMax = null;

document.addEventListener("DOMContentLoaded", () => {
    overlay = customOverlay(overlayInfo.transparentImgSrc, overlayInfo.bbox, map, 'OverlayView', false);
});

document.addEventListener("display-reset", () => {
    fileImgMap.clear();
    orderedFileNames = [];
    totalExpectedFiles = 0;
    currentIndex = 0;
    pause();
    overlay.setSource(overlayInfo.transparentImgSrc);
});

// Listen for total files count (dispatch this from your fetcher when you know the total)
document.addEventListener('files-total', event => {
    totalExpectedFiles = event.detail.total;
    orderedFileNames = event.detail.fileNames; // sorted list of filenames

    // Update slider range
    setSliderRange(0, totalExpectedFiles - 1);
});

function scaleColorMap(colorMap, referenceValue, binaryScale, decimalScale) {
    // Formula: real_value = (reference_value + scaled_value * 2^binary_scale) / 10^decimal_scale
    // Inverse:  scaled_value = (real_value * 10^decimal_scale - reference_value) / 2^binary_scale
    const decimalFactor = Math.pow(10, decimalScale);
    const binaryFactor = Math.pow(2, binaryScale);

    return colorMap.map(entry => ({
        min: entry.min === -Infinity ? -Infinity : (entry.min * decimalFactor - referenceValue) / binaryFactor,
        max: entry.max === Infinity ? Infinity : (entry.max * decimalFactor - referenceValue) / binaryFactor,
        rgba: entry.rgba,
    }));
}

document.addEventListener("opacity-set", (event) => {
    const opacity = event.detail.opacity / 100;
    overlay.setOpacity(opacity);
})

document.addEventListener("palette-set", async event => {
    palette = event.detail.palette;

    // Regenerate all cached frames with the new palette
    for (const [file_name, entry] of fileImgMap) {
        entry.img = await generateImage(
            entry.file_data,
            entry.product_name,
            entry.referenceValue,
            entry.binaryScale,
            entry.decimalScale
        );
    }

    // Redisplay current frame with new palette
    if (fileImgMap.size > 0) {
        displayFrame(currentIndex);
    }
});

document.addEventListener("colorcount-set", async event => {
    colorCount = event.detail.colorCount;

    // Regenerate all cached frames with the new color count
    for (const [file_name, entry] of fileImgMap) {
        entry.img = await generateImage(
            entry.file_data,
            entry.product_name,
            entry.referenceValue,
            entry.binaryScale,
            entry.decimalScale
        );
    }

    // Redisplay current frame
    if (fileImgMap.size > 0) {
        displayFrame(currentIndex);
    }
});

document.addEventListener("range-set", async event => {
    rangeMin = event.detail.min;
    rangeMax = event.detail.max;

    // Regenerate all cached frames with the new range
    for (const [file_name, entry] of fileImgMap) {
        entry.img = await generateImage(
            entry.file_data,
            entry.product_name,
            entry.referenceValue,
            entry.binaryScale,
            entry.decimalScale
        );
    }

    // Redisplay current frame
    if (fileImgMap.size > 0) {
        displayFrame(currentIndex);
    }
});

const paletteRadioButtons = document.querySelectorAll('input[name="palette"]');

function setSelectedPalette(paletteName) {
    paletteRadioButtons.forEach(radio => {
        radio.checked = radio.value === paletteName;
    });
}

document.addEventListener("visualization-reset", () => {
    colorCount = null;
    rangeMin = null;
    rangeMax = null;
});

const colorCountInput = document.getElementById("mrms-color-count");
const rangeMinSlider = document.getElementById("mrms-min");
const rangeMaxSlider = document.getElementById("mrms-max");
const rangeValueLabel = document.getElementById("mrms-range-value-label");

async function generateImage(file_data, product_name, referenceValue, binaryScale, decimalScale) {
    const selectedProduct = products.find(p => p.s3_name === product_name);

    // Initialize range sliders from product thresholds if not set
    if (rangeMin === null || rangeMax === null) {
        const productMin = selectedProduct.thresholds[0];
        const productMax = selectedProduct.thresholds[selectedProduct.thresholds.length - 1];

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

    // If palette is 'default' but we have custom settings, switch to viridis
    if (palette === 'default' && (colorCount !== null || rangeMin !== null || rangeMax !== null)) {
        palette = 'viridis';
        setSelectedPalette('viridis');
    }

    const colorMap = getActiveColorMap(selectedProduct, palette, colorCount, rangeMin, rangeMax);

    colorCountInput.value = colorMap.length - 2;

    const scaledColorMap = scaleColorMap(colorMap, referenceValue, binaryScale, decimalScale);
    const raster = new RasterGenerator(file_data, overlayInfo.numCols, overlayInfo.numRows, scaledColorMap);
    return await raster.generateUrl();
}

document.addEventListener('display-file', async event => {
    const { file_name, file_data, product_name, referenceValue, binaryScale, decimalScale } = event.detail;

    const img = await generateImage(file_data, product_name, referenceValue, binaryScale, decimalScale);

    // Store both the image and raw data for regeneration
    fileImgMap.set(file_name, {
        img,
        file_data,
        product_name,
        referenceValue,
        binaryScale,
        decimalScale,
    });

    // If this is the first file, and we're not playing, display it
    if (fileImgMap.size === 1 && !isPlaying) {
        displayFrame(0);
    }
});

function displayFrame(index) {
    if (index < 0 || index >= orderedFileNames.length) return;

    const fileName = orderedFileNames[index];
    const entry = fileImgMap.get(fileName);

    if (entry) {
        overlay.setSource(entry.img);
        currentIndex = index;

        // Update slider position
        setSliderValue(index);
    }
}

function play() {
    if (isPlaying) return;
    isPlaying = true;

    playInterval = setInterval(() => {
        // Move to next frame
        let nextIndex = currentIndex + 1;

        // Loop back to start if at end
        if (nextIndex >= orderedFileNames.length) {
            nextIndex = 0;
        }

        // Only advance if the frame is ready
        const fileName = orderedFileNames[nextIndex];
        if (fileImgMap.has(fileName)) {
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

// Listen for player events
document.addEventListener('player-play', () => {
    play();
});

document.addEventListener('player-pause', () => {
    pause();
});

document.addEventListener('player-seek', event => {
    const index = event.detail.index;
    displayFrame(index);
});

document.addEventListener('player-step', event => {
    const newIndex = currentIndex + event.detail.direction;
    displayFrame(newIndex); // this already calls setSliderValue on success
});
export { play, pause, displayFrame, fileImgMap };