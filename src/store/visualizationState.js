// Singleton store for visualization settings
// Custom colors persist per product AND per palette

let palette = 'default';
let colorCount = null;
let rangeMin = null;
let rangeMax = null;
let currentProduct = null;

// Map<productName, Map<paletteName, Map<colorIndex, [r,g,b,a]>>>
const customColorsByProductAndPalette = new Map();

export const visualizationState = {
    // Getters
    getPalette() {
        return palette;
    },

    getColorCount() {
        return colorCount;
    },

    getRangeMin() {
        return rangeMin;
    },

    getRangeMax() {
        return rangeMax;
    },

    getCurrentProduct() {
        return currentProduct;
    },

    getCustomColors() {
        if (!currentProduct) return new Map();
        const productMap = customColorsByProductAndPalette.get(currentProduct);
        if (!productMap) return new Map();
        return productMap.get(palette) || new Map();
    },

    // Setters
    setPalette(value) {
        palette = value;
    },

    setColorCount(value) {
        colorCount = value;
    },

    setRangeMin(value) {
        rangeMin = value;
    },

    setRangeMax(value) {
        rangeMax = value;
    },

    setRange(min, max) {
        rangeMin = min;
        rangeMax = max;
    },

    setCurrentProduct(productName) {
        if (currentProduct !== productName) {
            // Reset visualization settings when product changes
            // but keep custom colors (they're scoped by product)
            palette = 'default';
            colorCount = null;
            rangeMin = null;
            rangeMax = null;
        }
        currentProduct = productName;
    },

    setCustomColor(index, rgba) {
        if (!currentProduct) return;

        if (!customColorsByProductAndPalette.has(currentProduct)) {
            customColorsByProductAndPalette.set(currentProduct, new Map());
        }
        const productMap = customColorsByProductAndPalette.get(currentProduct);

        if (!productMap.has(palette)) {
            productMap.set(palette, new Map());
        }
        productMap.get(palette).set(index, rgba);
    },

    // Reset to defaults (but keep custom colors)
    resetToDefaults() {
        colorCount = null;
        rangeMin = null;
        rangeMax = null;
    },

    // Check if using all defaults
    isDefault() {
        return palette === 'default'
            && colorCount === null
            && rangeMin === null
            && rangeMax === null
            && this.getCustomColors().size === 0;
    },

    // Check if we need to force non-default palette
    needsPaletteFallback() {
        return palette === 'default' && (colorCount !== null || rangeMin !== null || rangeMax !== null);
    },

    // Generate cache key for current settings
    getCacheKey() {
        const customColors = [...this.getCustomColors().entries()].sort((a, b) => a[0] - b[0]);
        return JSON.stringify({
            palette,
            colorCount,
            rangeMin,
            rangeMax,
            customColors,
        });
    },

    // Full clear (if ever needed)
    clear() {
        palette = 'default';
        colorCount = null;
        rangeMin = null;
        rangeMax = null;
        currentProduct = null;
        customColorsByProductAndPalette.clear();
    },
};