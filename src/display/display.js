import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";
import '../components/player/Player.js';
import { extractTimestampFromKey } from "../api/api.js";
import { products } from "./config.js";

// Running map of filename -> generated overlay/img
const fileImgMap = new Map();

// Ordered list of filenames for playback
let orderedFileNames = [];
let totalExpectedFiles = 0;
let currentIndex = 0;
let isPlaying = false;
let playInterval = null;

let overlay;
const transparentImgSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z/" +
    "CfAQADgwGf6tJVEwAAAABJRU5ErkJggg==";
document.addEventListener("LUT-ready", () => {
    overlay = customOverlay(transparentImgSrc, LUT.bbox, map, 'OverlayView', false);
});

// Listen for total files count (dispatch this from your fetcher when you know the total)
document.addEventListener('files-total', event => {
    totalExpectedFiles = event.detail.total;
    orderedFileNames = event.detail.fileNames; // sorted list of filenames

    // Update slider range
    const player = document.querySelector('player-component');
    if (player) {
        player.setTotalFiles(totalExpectedFiles);
    }
});

document.addEventListener('display-file', async event => {
    const file_name = event.detail.file_name;
    const file_data = event.detail.file_data;
    const product_name = event.detail.product_name;

    const colorMap = products[product_name].color_map;
    const raster = new RasterGenerator(file_data, LUT.ncols, LUT.nrows, colorMap);
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

    console.log(`Displaying: ${extractTimestampFromKey(fileName)}`);

    if (img) {
        overlay.setSource(img);
        currentIndex = index;

        // Update slider position
        const player = document.querySelector('player-component');
        if (player) {
            player.setCurrentIndex(index);
        }
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