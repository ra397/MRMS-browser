import { palettes } from './palettes.js';

export function samplePalette(palette, numStops) {
    if (numStops === 1) return [palette[0]];

    const colors = [];
    for (let i = 0; i < numStops; i++) {
        const index = Math.round(i * 254 / (numStops - 1));
        colors.push(palette[index]);
    }
    console.log(colors);
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

export function getActiveColorMap(product, paletteName = 'default') {
    const { thresholds, defaultColors } = product;

    let colors;
    if (paletteName === 'default') {
        colors = defaultColors;
    } else {
        const palette = palettes[paletteName];
        colors = samplePalette(palette, thresholds.length - 1);
    }
    return generateColorMap(thresholds, colors);
}