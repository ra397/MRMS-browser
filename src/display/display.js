import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";
import '../components/player/Player.js';
import { extractTimestampFromKey } from "../api/api.js";

// Running map of filename -> generated overlay/img
const fileImgMap = new Map();

// Ordered list of filenames for playback
let orderedFileNames = [];
let totalExpectedFiles = 0;
let currentIndex = 0;
let isPlaying = false;
let playInterval = null;

let overlay;
document.addEventListener("LUT-ready", () => {
    overlay = customOverlay('', LUT.bbox, map, 'OverlayView', 1);
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

    const QPE_1H_COLORS = [
        { min: -Infinity, max: 32, rgba: [0, 0, 0, 0] },
        { min: 32, max: 63, rgba: [191, 255, 232, 255] },
        { min: 63, max: 127, rgba: [80, 209, 250, 255] },
        { min: 127, max: 254, rgba: [0, 166, 212, 255] },
        { min: 254, max: 508, rgba: [221, 255, 153, 255] },
        { min: 508, max: 762, rgba: [170, 255, 0, 255] },
        { min: 762, max: 1016, rgba: [82, 189, 0, 255] },
        { min: 1016, max: 1270, rgba: [255, 255, 111, 255] },
        { min: 1270, max: 1524, rgba: [246, 227, 0, 255] },
        { min: 1524, max: 1778, rgba: [230, 153, 0, 255] },
        { min: 1778, max: 2032, rgba: [240, 47, 34, 255] },
        { min: 2032, max: 2286, rgba: [171, 0, 0, 255] },
        { min: 2286, max: 2540, rgba: [171, 0, 0, 255] },
        { min: 2540, max: Infinity, rgba: [53, 37, 0, 255] },
    ];
    const raster = new RasterGenerator(file_data, LUT.ncols, LUT.nrows, QPE_1H_COLORS);
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