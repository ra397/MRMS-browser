import { db } from '../database/db.js';

document.addEventListener('time-selected', async event => {
    const localStartTime = event.detail.startDate;
    const localEndTime = event.detail.endDate;

    const start_YYYYMMDD = extractYYYYMMDD(localStartTime.toISOString());
    const end_YYYYMMDD = extractYYYYMMDD(localEndTime.toISOString());

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
        const file_timestamp = extractTimestampFromKey(file);
        if (file_timestamp > localStartTime.toISOString() && file_timestamp <= localEndTime.toISOString()) {
            files_to_fetch.push(file);
        }
    }

    // Sort files by timestamp to ensure correct playback order
    files_to_fetch.sort((a, b) => {
        const timestampA = extractTimestampFromKey(a);
        const timestampB = extractTimestampFromKey(b);
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

    // Stream files one at a time for decoder
    for (const file_name of files_to_fetch) {
        const isCached = await db.hasFile(file_name);

        if (isCached) {
            document.dispatchEvent(new CustomEvent('decode-file', {
                detail: {
                    file_data: null,
                    file_name: file_name,
                },
                composed: true,
                bubbles: true,
            }));
        } else {
            const file_data = await fetchFile(file_name);
            if (file_data) {
                document.dispatchEvent(new CustomEvent('decode-file', {
                    detail: {
                        file_data: file_data,
                        file_name: file_name,
                    },
                    composed: true,
                    bubbles: true,
                }));
            }
        }
    }
});

async function getFiles(day) {
    try {
        const response = await fetch(`https://noaa-mrms-pds.s3.amazonaws.com/?list-type=2&delimiter=/&prefix=CONUS/MultiSensor_QPE_01H_Pass1_00.00/${day}/`);
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

async function fetchFile(path) {
    const url = "https://noaa-mrms-pds.s3.amazonaws.com/" + path;
    try {
        const response = await fetch(url);
        const gzippedData = (await response.blob()).stream();
        const ds = new DecompressionStream("gzip");
        const decompressedData = gzippedData.pipeThrough(ds);
        return await new Response(decompressedData).arrayBuffer();
    } catch (err) {
        console.error(err.message);
        return null;
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

    const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
    ));

    return date.toISOString();
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