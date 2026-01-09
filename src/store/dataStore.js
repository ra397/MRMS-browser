// Singleton store for raw decoded file data
// Files stored here are never re-fetched during the session

const files = new Map(); // Map<fileName, { data, productName, referenceValue, binaryScale, decimalScale }>
let activeFiles = [];    // Currently active file list for playback (ordered)

export const dataStore = {
    has(fileName) {
        return files.has(fileName);
    },

    get(fileName) {
        return files.get(fileName);
    },

    set(fileName, { data, productName, referenceValue, binaryScale, decimalScale }) {
        files.set(fileName, { data, productName, referenceValue, binaryScale, decimalScale });
    },

    setActiveFiles(fileNames) {
        activeFiles = [...fileNames];
    },

    getActiveFiles() {
        return activeFiles;
    },

    getActiveFile(index) {
        return activeFiles[index];
    },

    getActiveFileCount() {
        return activeFiles.length;
    },

    // Clear everything (e.g., on product change)
    clear() {
        files.clear();
        activeFiles = [];
    },

    // Clear only the active list, keep cached data
    clearActiveFiles() {
        activeFiles = [];
    },
};