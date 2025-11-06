import { Grib2Decoder } from './grib2/grib2.js';
import './lut/generateLUT.js';

document.addEventListener('decode-files', async event => {
    function pngDecoder (imageBytes) {
        return fastPng.decode(imageBytes).data.slice(0);
    }

    const grib2Decoder = new Grib2Decoder(
        {
            log: false,
            numMembers: 1,
            pngDecoder: pngDecoder,
        }
    )

    const matrices = [];
    for (const rawData of event.detail.results) {
        grib2Decoder.parse(new Uint8Array(rawData));

        if (!LUT) {
            break;
        }
        const matrix = await generateMatrixUsingLUT(grib2Decoder.data, LUT.ncols, LUT.nrows);
        matrices.push(matrix);
    }

    document.dispatchEvent(new CustomEvent('display-matrices', {
        detail: {
            results: matrices,
            files: event.detail.files,
        },
        composed: true,
        bubbles: true,
    }));
});

async function generateMatrixUsingLUT(values, numCols, numRows) {
    const total = numCols * numRows;
    const raster = new Float32Array(total);

    for (let i = 0; i < total; i++) {
        const dataIndex = LUT.mrms_1d_ix[i];
        raster[i] = values[dataIndex];
    }
    return raster;
}