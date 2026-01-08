import './legend.css';

const legendContainer = document.getElementById('color-legend');
const legendTitle = legendContainer.querySelector('.legend-title');
const legendBar = legendContainer.querySelector('.legend-bar');
const legendLabels = legendContainer.querySelector('.legend-labels');

function getLabelIndices(thresholdCount, isDefault) {
    // Returns array of indices into thresholds array to display as labels

    if (isDefault) {
        // Show all thresholds
        return Array.from({ length: thresholdCount }, (_, i) => i);
    }

    // For custom: pick max that fits nicely
    const maxTicks = 9;

    if (thresholdCount <= maxTicks) {
        // Show all if few enough
        return Array.from({ length: thresholdCount }, (_, i) => i);
    }

    // Pick 5, 7, or 9 - whichever divides most evenly
    let numLabels = 7; // Default fallback
    for (const n of [9, 7, 5]) {
        if ((thresholdCount - 1) % (n - 1) === 0) {
            numLabels = n;
            break;
        }
    }

    // Generate evenly spaced indices
    const indices = [];
    for (let i = 0; i < numLabels; i++) {
        const index = Math.round(i * (thresholdCount - 1) / (numLabels - 1));
        indices.push(index);
    }
    return indices;
}

function formatValue(value) {
    // Format threshold value for display
    if (Number.isInteger(value)) {
        return value.toString();
    }
    // Show up to 2 decimal places, trim trailing zeros
    return parseFloat(value.toFixed(2)).toString();
}

export function updateLegend(colorMap, thresholds, units, isDefault) {
    // colorMap: array of {min, max, rgba} - includes -Infinity/+Infinity entries
    // thresholds: array of threshold values (without infinities)
    // units: string like 'mm', 'dBZ', or undefined
    // isDefault: boolean - true if using product's original thresholds

    // Update title (units)
    legendTitle.textContent = units || '';

    // Build color segments (skip first and last colorMap entries which are -Infinity/+Infinity)
    const colorSegments = colorMap.slice(1, -1);

    legendBar.innerHTML = colorSegments.map((entry, index) => {
        const [r, g, b, a] = entry.rgba;
        return `<div class="legend-segment" data-index="${index}" style="background-color: rgba(${r},${g},${b},${a / 255});"></div>`;
    }).join('');

    // Determine which threshold labels to show
    const labelIndices = getLabelIndices(thresholds.length, isDefault);

    // Build labels
    // They are positioned using flexbox space-between
    // We need to include empty spacers for skipped labels
    legendLabels.innerHTML = labelIndices.map(index => {
        const value = thresholds[index];
        return `<span class="legend-label" data-index="${index}">${formatValue(value)}</span>`;
    }).join('');
}