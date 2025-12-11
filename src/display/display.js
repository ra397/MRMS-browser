import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";
import { products, overlayInfo } from "./config.js";
import { setSliderRange, setSliderValue } from "../components/player/player.js";

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

// Listen for total files count (dispatch this from your fetcher when you know the total)
document.addEventListener('files-total', event => {
    totalExpectedFiles = event.detail.total;
    orderedFileNames = event.detail.fileNames; // sorted list of filenames

    // Update slider range
    setSliderRange(0, totalExpectedFiles - 1);
});

document.addEventListener('display-file', async event => {
    const file_name = event.detail.file_name;
    const file_data = event.detail.file_data;
    const product_name = event.detail.product_name;

    const colorMap = products.find(p => p.s3_name === product_name)?.color_map;
    const raster = new RasterGenerator(file_data, overlayInfo.numCols, overlayInfo.numRows, colorMap);
    const img = await raster.generateUrl();

    // Store in running map
    fileImgMap.set(file_name, img);

    console.log(`Ready for display: ${file_name}`, img);

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

export { play, pause, displayFrame, fileImgMap };