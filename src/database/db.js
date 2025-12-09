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
                db.createObjectStore(STORE_NAME);
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
        return await decompress(compressedData);
    } catch (error) {
        console.error('Error in getDecodedData:', error);
        return null;
    }
}

async function saveDecodedData(fileName, decodedData) {
    try {
        // Compress before storing
        const compressedData = await compress(decodedData);

        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(compressedData, fileName);

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

export const db = {
    hasFile,
    getDecodedData,
    saveDecodedData,
    clearCache
};