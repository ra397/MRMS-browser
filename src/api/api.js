import { emitDBChange } from "../database/db.js";

// State tracking
const state = {
    product: null,
    startTime: null,
    endTime: null,
};

// Web Worker instance - initialized once at module load
const fetchAndDecodeWorker = new Worker(new URL('./api-worker.js', import.meta.url), { type: 'module' });

fetchAndDecodeWorker.onmessage = (event) => {
    const { type, product_name, file_name, file_data, error } = event.data;

    if (type === 'file-ready') {
        // Dispatch directly to display module (decoding already done in worker)
        document.dispatchEvent(new CustomEvent('display-file', {
            detail: {
                product_name: product_name,
                file_data: file_data,
                file_name: file_name,
            },
            composed: true,
            bubbles: true,
        }));
    } else if (type === 'file-error') {
        console.error(`Failed to process file: ${file_name}`, error);
    } else if (type === 'db-change') {
        emitDBChange();
    }
};

fetchAndDecodeWorker.onerror = (error) => {
    console.error('Worker error:', error);
};

document.addEventListener('product-selected', event => {
    state.product = event.detail.product;

    if (state.startTime && state.endTime) {
        fetchData();
    }
});

document.addEventListener('time-selected', event => {
    state.startTime = event.detail.startDate;
    state.endTime = event.detail.endDate;

    if (state.product) {
        fetchData();
    }
});

async function fetchData() {
    const start_YYYYMMDD = extractYYYYMMDD(state.startTime.toISOString());
    const end_YYYYMMDD = extractYYYYMMDD(state.endTime.toISOString());

    const dates = getDatesBetween(start_YYYYMMDD, end_YYYYMMDD);

    const possible_files = [];

    for (const date of dates) {
        const files_for_that_day = await getFiles(date);
        for (const file of files_for_that_day) {
            possible_files.push(file);
        }
    }

    const files_to_fetch = [];

    for (const file of possible_files) {
        const file_timestamp = extractTimestampFromKey(file).toISOString();
        if (file_timestamp > state.startTime.toISOString() && file_timestamp <= state.endTime.toISOString()) {
            files_to_fetch.push(file);
        }
    }

    // Sort files by timestamp to ensure correct playback order
    files_to_fetch.sort((a, b) => {
        const timestampA = extractTimestampFromKey(a).toISOString();
        const timestampB = extractTimestampFromKey(b).toISOString();
        return timestampA.localeCompare(timestampB);
    });

    // Dispatch total files count BEFORE streaming files
    document.dispatchEvent(new CustomEvent('files-total', {
        detail: {
            total: files_to_fetch.length,
            fileNames: files_to_fetch
        },
        composed: true,
        bubbles: true,
    }));

    // Send files to worker for fetching and decoding
    fetchAndDecodeWorker.postMessage({
        type: 'fetch-files',
        files: files_to_fetch,
        productName: state.product,
    });
}

async function getFiles(day) {
    const product = state.product;
    try {
        const response = await fetch(`https://noaa-mrms-pds.s3.amazonaws.com/?list-type=2&delimiter=/&prefix=CONUS/${product}/${day}/`);
        const xmlString = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        const keyElements = xmlDoc.getElementsByTagName("Key");

        const filenames = [];
        for (let i = 0; i < keyElements.length; i++) {
            filenames.push(keyElements[i].textContent);
        }
        return filenames;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export function extractTimestampFromKey(filename) {
    const match = filename.match(/(\d{8})-(\d{6})\.grib2\.gz$/);

    if (!match) {
        throw new Error("No valid timestamp found in the input string.");
    }

    const [_, yyyymmdd, hhmmss] = match;

    const year = yyyymmdd.substring(0, 4);
    const month = yyyymmdd.substring(4, 6);
    const day = yyyymmdd.substring(6, 8);

    const hour = hhmmss.substring(0, 2);
    const minute = hhmmss.substring(2, 4);
    const second = hhmmss.substring(4, 6);

    return new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    ));
}

function extractYYYYMMDD(isoString) {
    const date = new Date(isoString);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

function getDatesBetween(startDate, endDate) {
    const parseDate = (dateStr) => {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        return new Date(year, month, day);
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const dates = [];

    const current = new Date(start);
    while (current <= end) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}