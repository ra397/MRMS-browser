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

document.addEventListener('display-file', async event => {
    const file_name = event.detail.file_name;
    const file_data = event.detail.file_data;
    const product_name = event.detail.product_name;
    const referenceValue = event.detail.referenceValue;
    const binaryScale = event.detail.binaryScale;
    const decimalScale = event.detail.decimalScale;

    const selectedProduct = products.find(p => p.s3_name === product_name);
    const colorMap = getActiveColorMap(selectedProduct, "greys");
    const scaledColorMap = scaleColorMap(colorMap, referenceValue, binaryScale, decimalScale);
    const raster = new RasterGenerator(file_data, overlayInfo.numCols, overlayInfo.numRows, scaledColorMap);
    const img = await raster.generateUrl();

    // Store in running map
    fileImgMap.set(file_name, img);

    // If this is the first file, and we're not playing, display it
    if (fileImgMap.size === 1 && !isPlaying) {
        displayFrame(0);
    }
});

function displayFrame(index) {
    if (index < 0 || index >= orderedFileNames.length) return;

    const fileName = orderedFileNames[index];
    const img = fileImgMap.get(fileName);

    if (img) {
        overlay.setSource(img);
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