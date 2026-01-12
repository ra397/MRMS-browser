import {db, emitDBChange} from "../database/db.js";
import {dataStore} from "../store/dataStore.js";
import {showModal} from "../components/modal/modal.js";

// State tracking - represents what is currently being fetched (or last fetched)
const state = {
    product: null,
    startTime: null,
    endTime: null,
};

// Request tracking
let isFetching = false;
let currentAbortController = null;

// Web Worker instance - initialized once at module load
const fetchAndDecodeWorker = new Worker(new URL('./api-worker.js', import.meta.url), { type: 'module' });

fetchAndDecodeWorker.onerror = (error) => {
    console.error('Worker error:', error);
};

/**
 * Determines if we should prompt the user to cancel the current fetch.
 * Returns true if:
 * - Product changed, OR
 * - New interval is a strict subset of current, OR
 * - New interval has no overlap with current
 */
function shouldPromptCancel(currentProduct, currentStart, currentEnd, newProduct, newStart, newEnd) {
    // Product change - always prompt
    if (newProduct !== currentProduct) {
        return true;
    }

    const currentStartMs = currentStart.getTime();
    const currentEndMs = currentEnd.getTime();
    const newStartMs = newStart.getTime();
    const newEndMs = newEnd.getTime();

    // No overlap - completely different interval
    if (newEndMs <= currentStartMs || newStartMs >= currentEndMs) {
        return true;
    }

    // Strict subset - new interval is entirely within current interval
    // (and not equal to it)
    const isSubset = newStartMs >= currentStartMs && newEndMs <= currentEndMs;
    const isEqual = newStartMs === currentStartMs && newEndMs === currentEndMs;
    if (isSubset && !isEqual) {
        return true;
    }

    // Extension or partial overlap - don't prompt
    return false;
}

async function handleNewRequest(newProduct, newStartTime, newEndTime) {
    if (!isFetching) {
        // No fetch in progress - just start the new one
        state.product = newProduct;
        state.startTime = newStartTime;
        state.endTime = newEndTime;
        fetchData();
        return;
    }

    // A fetch is in progress - determine if we should prompt
    if (shouldPromptCancel(state.product, state.startTime, state.endTime, newProduct, newStartTime, newEndTime)) {
        const shouldCancel = await showModal(
            'Data fetching currently in progress. Would you like to cancel it and start the new request?',
            { confirmText: 'Yes, cancel', cancelText: 'No, wait' }
        );

        if (shouldCancel) {
            // Cancel current request
            if (currentAbortController) {
                currentAbortController.abort();
            }
            // Start new request
            state.product = newProduct;
            state.startTime = newStartTime;
            state.endTime = newEndTime;
            fetchData();
        }
        // If user chose "No, wait" - do nothing, let current fetch continue
    } else {
        // Extension or partial overlap - let current fetch continue
        // The new request parameters are ignored; user can re-request after current finishes
    }
}

document.addEventListener('product-selected', event => {
    const newProduct = event.detail.product;

    if (state.startTime && state.endTime) {
        handleNewRequest(newProduct, state.startTime, state.endTime);
    } else {
        state.product = newProduct;
    }
});

document.addEventListener('time-selected', event => {
    const newStartTime = event.detail.startDate;
    const newEndTime = event.detail.endDate;

    if (state.product) {
        handleNewRequest(state.product, newStartTime, newEndTime);
    } else {
        state.startTime = newStartTime;
        state.endTime = newEndTime;
    }
});

async function fetchData() {
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;
    isFetching = true;

    try {
        const start_YYYYMMDD = extractYYYYMMDD(state.startTime.toISOString());
        const end_YYYYMMDD = extractYYYYMMDD(state.endTime.toISOString());

        const dates = getDatesBetween(start_YYYYMMDD, end_YYYYMMDD);

        const possible_files = [];

        for (const date of dates) {
            if (signal.aborted) return;
            const files_for_that_day = await getFiles(date, signal);
            for (const file of files_for_that_day) {
                possible_files.push(file);
            }
        }

        if (signal.aborted) return;

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

        const filesToActuallyFetch = files_to_fetch.filter(file => !dataStore.has(file));

        // Dispatch total files count BEFORE streaming files
        document.dispatchEvent(new CustomEvent('files-total', {
            detail: {
                total: files_to_fetch.length,
                fileNames: files_to_fetch
            },
        }));

        // For files already in memory, dispatch display-file with cached data
        for (const fileName of files_to_fetch) {
            if (signal.aborted) return;
            if (dataStore.has(fileName)) {
                const cached = dataStore.get(fileName);
                dispatchDisplayFile(
                    cached.productName,
                    fileName,
                    cached.data,
                    cached.referenceValue,
                    cached.binaryScale,
                    cached.decimalScale
                );
            }
        }

        // Fetch only what's missing
        const cacheStatus = await db.hasFiles(filesToActuallyFetch);
        for (const { fileName, isCached } of cacheStatus) {
            if (signal.aborted) return;
            if (isCached) {
                const result = await db.getDecodedData(fileName);
                dispatchDisplayFile(state.product, fileName, result.data, result.referenceValue, result.binaryScale,
                    result.decimalScale);
            } else {
                await fetchAndDecodeFile(fileName, signal);
            }
        }
        emitDBChange();
    } finally {
        isFetching = false;
        currentAbortController = null;
    }
}

function dispatchDisplayFile(product_name, file_name, file_data, referenceValue, binaryScale, decimalScale) {
    document.dispatchEvent(new CustomEvent('display-file', {
        detail: {
            product_name: product_name,
            file_data: file_data,
            file_name: file_name,
            referenceValue: referenceValue,
            binaryScale: binaryScale,
            decimalScale: decimalScale,
        },
    }));
}

function fetchAndDecodeFile(fileName, signal) {
    return new Promise((resolve, reject) => {
        if (signal && signal.aborted) {
            resolve();
            return;
        }

        const handler = async (event) => {
            const {type, product_name, file_name, file_data, reference_value, binary_scale, decimal_scale, error} = event.data;
            if (file_name !== fileName) return; // Not our file, ignore

            fetchAndDecodeWorker.removeEventListener('message', handler);
            if (signal) {
                signal.removeEventListener('abort', abortHandler);
            }

            if (type === 'file-ready') {
                if (signal && signal.aborted) {
                    resolve();
                    return;
                }
                await db.saveDecodedData(file_name, file_data, reference_value, binary_scale, decimal_scale);
                dispatchDisplayFile(product_name, file_name, file_data, reference_value, binary_scale, decimal_scale);
                resolve();
            } else if (type === 'file-error') {
                console.error(`Failed to process: ${file_name}`, error);
                reject(error);
            }
        };

        const abortHandler = () => {
            fetchAndDecodeWorker.removeEventListener('message', handler);
            resolve();
        };

        if (signal) {
            signal.addEventListener('abort', abortHandler);
        }

        fetchAndDecodeWorker.addEventListener('message', handler);

        fetchAndDecodeWorker.postMessage({
            type: 'fetch-file',
            fileName: fileName,
            productName: state.product,
        });
    });
}

async function getFiles(day, signal) {
    const product = state.product;
    try {
        const response = await fetch(`https://noaa-mrms-pds.s3.amazonaws.com/?list-type=2&delimiter=/&prefix=CONUS/${product}/${day}/`, { signal });
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
        if (e.name === 'AbortError') {
            return [];
        }
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