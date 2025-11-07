import { RasterGenerator } from "./rasterGenerator.js";
import { customOverlay } from "./customOverlay.js";

/*
* Per request fileDataMap
* Display an img with data from the first file
* Add an event listener to a slider, to shuffle through and display the other files
*  */

document.addEventListener('display-matrices', async event => {
    const requestFileDataMap = {};

    const files = event.detail.files;
    const matrices = event.detail.results;

    for (let i = 0; i < files.length; i++) {
        requestFileDataMap[files[i]] = matrices[i];
    }

    for (const matrix of matrices) {
        const raster = new RasterGenerator(matrix, LUT.ncols, LUT.nrows);
        const img = await raster.generateUrl();
        console.log(img);
        const overlay = customOverlay(img, LUT.bbox, map, 'OverlayView', 1);
    }
});