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
        return new Promise((resolve, reject) => {
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
    } catch (error) {
        console.error('Error in getDecodedData:', error);
        return null;
    }
}

async function saveDecodedData(fileName, decodedData) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(decodedData, fileName);

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