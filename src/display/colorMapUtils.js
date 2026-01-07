import { palettes } from './palettes.js';

export function samplePalette(palette, numStops) {
    if (numStops === 1) return [palette[0]];

    const colors = [];
    for (let i = 0; i < numStops; i++) {
        const index = Math.round(i * 254 / (numStops - 1));
        colors.push(palette[index]);
    }
    return colors;
}

export function generateColorMap(thresholds, colors) {
    const colorMap = [];

    // First bin: -Infinity to first threshold, transparent
    colorMap.push({
        min: -Infinity,
        max: thresholds[0],
        rgba: [0, 0, 0, 0]
    });

    // Middle bins: each threshold pair gets a color
    for (let i = 0; i < thresholds.length - 1; i++) {
        colorMap.push({
            min: thresholds[i],
            max: thresholds[i + 1],
            rgba: colors[i]
        });
    }

    // Last bin: final threshold to Infinity, same color as previous
    colorMap.push({
        min: thresholds[thresholds.length - 1],
        max: Infinity,
        rgba: colors[colors.length - 1]
    });

    return colorMap;
}

export function generateEvenThresholds(min, max, numColors) {
    const thresholds = [];
    const step = (max - min) / numColors;
    for (let i = 0; i <= numColors; i++) {
        thresholds.push(min + i * step);
    }
    return thresholds;
}


export function getActiveColorMap(product, paletteName = 'default', numColors = null, rangeMin = null, rangeMax = null) {
    const { thresholds: productThresholds, defaultColors } = product;

    // Determine the value range
    const minValue = rangeMin !== null ? rangeMin : productThresholds[0];
    const maxValue = rangeMax !== null ? rangeMax : productThresholds[productThresholds.length - 1];

    // Determine number of color bins
    const colorCount = numColors !== null ? numColors : productThresholds.length - 1;

    // Use custom thresholds if numColors or range differs from default
    const useCustomThresholds = numColors !== null || rangeMin !== null || rangeMax !== null;
    const thresholds = useCustomThresholds
        ? generateEvenThresholds(minValue, maxValue, colorCount)
        : productThresholds;

    // Get colors
    let colors;
    if (paletteName === 'default' && !useCustomThresholds) {
        colors = defaultColors;
    } else {
        const palette = palettes[paletteName] || palettes['viridis'];
        colors = samplePalette(palette, colorCount);
    }
    return generateColorMap(thresholds, colors);
}