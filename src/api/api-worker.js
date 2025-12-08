import { db } from '../database/db.js';
import { Grib2Decoder } from '../decode/grib2/grib2.js';
import fastPng from "../decode/fastpng/fast-png-bundle.js";

// LUT loaded once when worker initializes
let LUT = null;

async function loadLUT() {
    if (LUT) return;

    const response = await fetch("/mrms-browser/MRMS_LUT.json");
    LUT = await response.json();

    // Convert "mrms_1d_ix" from base64 string to typed array
    const dataUri = atob(LUT.mrms_1d_ix);
    const bytes = new Uint8Array(dataUri.length);
    for (let i = 0; i < dataUri.length; i++) {
        bytes[i] = dataUri.charCodeAt(i);
    }
    LUT.mrms_1d_ix = new Int32Array(bytes.buffer);
}

async function fetchFile(path) {
    const url = "https://noaa-mrms-pds.s3.amazonaws.com/" + path;
    try {
        const response = await fetch(url);
        const gzippedData = (await response.blob()).stream();
        const ds = new DecompressionStream("gzip");
        const decompressedData = gzippedData.pipeThrough(ds);
        return await new Response(decompressedData).arrayBuffer();
    } catch (err) {
        console.error('Worker: Fetch error:', err.message);
        return null;
    }
}

function decodeGrib2(rawData) {
    function pngDecoder(imageBytes) {
        return fastPng.decode(imageBytes).data.slice(0);
    }

    const grib2Decoder = new Grib2Decoder({
        log: false,
        numMembers: 1,
        pngDecoder: pngDecoder,
    });

    grib2Decoder.parse(new Uint8Array(rawData));
    return grib2Decoder.data;
}

function generateMatrixUsingLUT(values, numCols, numRows) {
    const total = numCols * numRows;
    const raster = new Float32Array(total);

    for (let i = 0; i < total; i++) {
        const dataIndex = LUT.mrms_1d_ix[i];
        raster[i] = values[dataIndex];
    }
    return raster;
}

async function processFiles(files, productName) {
    // Ensure LUT is loaded before processing
    await loadLUT();

    for (const fileName of files) {
        try {
            const isCached = await db.hasFile(fileName);
            let decodedData;

            if (isCached) {
                // Get decoded data from IndexedDB
                decodedData = await db.getDecodedData(fileName);

                if (!decodedData) {
                    console.error(`Worker: Failed to retrieve cached data for: ${fileName}`);
                    self.postMessage({
                        type: 'file-error',
                        file_name: fileName,
                        error: 'Failed to retrieve cached data',
                    });
                    continue;
                }
            } else {
                // Fetch from S3
                const rawData = await fetchFile(fileName);

                if (!rawData) {
                    self.postMessage({
                        type: 'file-error',
                        file_name: fileName,
                        error: 'Failed to fetch file',
                    });
                    continue;
                }

                // Decode GRIB2
                const gribData = decodeGrib2(rawData);

                // Apply LUT transformation
                decodedData = generateMatrixUsingLUT(gribData, LUT.ncols, LUT.nrows);

                // Save to IndexedDB
                await db.saveDecodedData(fileName, decodedData);
            }

            // Send decoded data back to main thread
            self.postMessage({
                type: 'file-ready',
                product_name: productName,
                file_name: fileName,
                file_data: decodedData,
            }, [decodedData.buffer]);

        } catch (err) {
            console.error(`Worker: Error processing ${fileName}:`, err);
            self.postMessage({
                type: 'file-error',
                file_name: fileName,
                error: err.message,
            });
        }
    }

    self.postMessage({
        type: 'batch-complete',
    });
}

self.onmessage = (event) => {
    const { type, files, productName } = event.data;

    if (type === 'fetch-files') {
        processFiles(files, productName);
    }
};