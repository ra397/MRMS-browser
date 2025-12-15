const DB_NAME = 'grib2-cache';
const DB_VERSION = 1;
const STORE_NAME = 'decoded-files';

let dbPromise = null;

function openDB() {
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME);
                store.createIndex("byIngestTime", "ingestTime");
            }
        };
    });
    return dbPromise;
}

// Compression utilities
async function compress(uint16Array) {
    const stream = new Blob([uint16Array])
        .stream()
        .pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(compressedData) {
    const stream = new Blob([compressedData])
        .stream()
        .pipeThrough(new DecompressionStream('gzip'));
    return new Uint16Array(await new Response(stream).arrayBuffer());
}

async function hasFile(fileName) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getKey(fileName);

            request.onsuccess = () => {
                resolve(request.result !== undefined);
            };

            request.onerror = () => {
                console.error('Error checking file existence:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error in hasFile:', error);
        return false;
    }
}

async function hasFiles(fileNames) {
    const results = [];
    for (const fileName of fileNames) {
        results.push({ fileName, isCached: await hasFile(fileName) });
    }
    return results;
}

async function getDecodedData(fileName) {
    try {
        const db = await openDB();
        const compressedData = await new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(fileName);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error getting decoded data:', request.error);
                reject(request.error);
            };
        });

        if (!compressedData) {
            return null;
        }

        // Decompress before returning
        return await decompress(compressedData.data);
    } catch (error) {
        console.error('Error in getDecodedData:', error);
        return null;
    }
}

async function saveDecodedData(fileName, decodedData, scaleFactor) {
    try {
        // Compress before storing
        const compressedData = await compress(decodedData);

        const record = {
            data: compressedData,
            scaleFactor: scaleFactor,
            ingestTime: Date.now(),
        }

        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(record, fileName);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                console.error('Error saving decoded data:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error in saveDecodedData:', error);
        return false;
    }
}

async function getAllRecords() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();

            const records = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    records.push({
                        fileName: cursor.key,
                        ingestTime: cursor.value.ingestTime,
                        scaleFactor: cursor.value.scaleFactor,
                        compressedSize: cursor.value.data.byteLength // This is compressed size
                    });
                    cursor.continue();
                } else {
                    resolve(records);
                }
            };

            request.onerror = () => {
                console.error('Error getting all records:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error in getAllRecords:', error);
        return [];
    }
}

async function deleteFiles(fileNames) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            let deletedCount = 0;
            let errorCount = 0;

            for (const fileName of fileNames) {
                const request = store.delete(fileName);
                request.onsuccess = () => deletedCount++;
                request.onerror = () => errorCount++;
            }

            transaction.oncomplete = () => {
                resolve({ deletedCount, errorCount });
            };

            transaction.onerror = () => {
                console.error('Error deleting files:', transaction.error);
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error('Error in deleteFiles:', error);
        return { deletedCount: 0, errorCount: fileNames.length };
    }
}

async function clearCache() {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                console.error('Error clearing cache:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Error in clearCache:', error);
        return false;
    }
}

export function emitDBChange() {
    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('db-change'));
    } else {
        console.error("Trying to dispatchEvent outside of browser context.")
    }
}

export const db = {
    hasFile,
    hasFiles,
    getDecodedData,
    saveDecodedData,
    getAllRecords,
    deleteFiles,
    clearCache
};