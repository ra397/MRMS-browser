import { RasterGenerator } from "./rasterGenerator.js";
import '../display/customOverlay.js';

document.addEventListener('display-matrices', async event => {
    const matrices = event.detail.results;

    for (const matrix of matrices) {
        const raster = new RasterGenerator(matrix, LUT.ncols, LUT.nrows);
        const img = await raster.generateUrl();
        const overlay = new CustomOverlay(img, LUT.bbox, map, 'OverlayView', 1);
    }
});