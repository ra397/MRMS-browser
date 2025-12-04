import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";

// Running map of filename -> generated overlay/img
const fileOverlayMap = new Map();

document.addEventListener('display-file', async event => {
    const file_name = event.detail.file_name;
    const file_data = event.detail.file_data;

    const raster = new RasterGenerator(file_data, LUT.ncols, LUT.nrows);
    const img = await raster.generateUrl();

    const overlay = customOverlay(img, LUT.bbox, map, 'OverlayView', 1);

    // Store in running map
    fileOverlayMap.set(file_name, img);

    console.log(`Ready for display: ${file_name}`, img);
});