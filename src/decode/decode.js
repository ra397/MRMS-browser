import { Grib2Decoder } from './grib2/grib2.js';
import './lut/generateLUT.js';
import { db } from '../database/db.js';

document.addEventListener('decode-file', async event => {
    const rawData = event.detail.file_data;
    const file_name = event.detail.file_name;

    let decodedData;

    if (rawData === null) {
        // File is cached - retrieve decoded data from IndexedDB
        console.log("Getting data from IndexDB");

        decodedData = await db.getDecodedData(file_name);

        if (!decodedData) {
            console.error(`Failed to retrieve cached data for: ${file_name}`);
            return;
        }
    } else {
        console.log("Getting data from S3");
        // Raw data provided - decode it
        function pngDecoder(imageBytes) {
            return fastPng.decode(imageBytes).data.slice(0);
        }

        const grib2Decoder = new Grib2Decoder({
            log: false,
            numMembers: 1,
            pngDecoder: pngDecoder,
        });

        grib2Decoder.parse(new Uint8Array(rawData));

        if (!LUT) {
            console.error("LUT is not available.");
            return;
        }

        decodedData = await generateMatrixUsingLUT(grib2Decoder.data, LUT.ncols, LUT.nrows);

        // Save decoded data to IndexedDB
        await db.saveDecodedData(file_name, decodedData);
    }

    // Dispatch to display module
    document.dispatchEvent(new CustomEvent('display-file', {
        detail: {
            file_data: decodedData,
            file_name: file_name,
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