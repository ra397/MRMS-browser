// Singleton cache for generated image URLs
// Key: fileName + visualization settings hash

const cache = new Map(); // Map<compositeKey, imageUrl>

function getKey(fileName, vizCacheKey) {
    return `${fileName}::${vizCacheKey}`;
}

export const imageCache = {
    has(fileName, vizCacheKey) {
        return cache.has(getKey(fileName, vizCacheKey));
    },

    get(fileName, vizCacheKey) {
        return cache.get(getKey(fileName, vizCacheKey));
    },

    set(fileName, vizCacheKey, imageUrl) {
        cache.set(getKey(fileName, vizCacheKey), imageUrl);
    },

    // Clear all cached images (revoke URLs to free memory)
    clear() {
        for (const url of cache.values()) {
            URL.revokeObjectURL(url);
        }
        cache.clear();
    },

    // Get cache size (for debugging)
    size() {
        return cache.size;
    },
};