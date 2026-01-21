import './legend.css';

const legendContainer = document.getElementById('color-legend');
const legendTitle = legendContainer.querySelector('.legend-title');
const legendBar = legendContainer.querySelector('.legend-bar');
const legendLabels = legendContainer.querySelector('.legend-labels');

const colorPickerPopup = document.getElementById('color-picker-popup');
const colorPickerInput = document.getElementById('color-picker-input');
const colorPickerClose = colorPickerPopup.querySelector('.color-picker-close');

let selectedSegmentIndex = null;

function showLegend() {
    legendContainer.classList.remove('hidden');
}

export function hideLegend() {
    closeColorPicker();
    legendContainer.classList.add('hidden');
}

document.addEventListener('display-reset', hideLegend);
document.addEventListener('mrms-clear', hideLegend);

function getLabelIndices(thresholdCount, isDefault) {
    if (isDefault) {
        return Array.from({ length: thresholdCount }, (_, i) => i);
    }

    const maxTicks = 9;

    if (thresholdCount <= maxTicks) {
        return Array.from({ length: thresholdCount }, (_, i) => i);
    }

    let numLabels = 7;
    for (const n of [9, 7, 5]) {
        if ((thresholdCount - 1) % (n - 1) === 0) {
            numLabels = n;
            break;
        }
    }

    const indices = [];
    for (let i = 0; i < numLabels; i++) {
        const index = Math.round(i * (thresholdCount - 1) / (numLabels - 1));
        indices.push(index);
    }
    return indices;
}

function formatValue(value) {
    if (Number.isInteger(value)) {
        return value.toString();
    }
    return parseFloat(value.toFixed(2)).toString();
}

function rgbaToHex(rgba) {
    const [r, g, b] = rgba;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgba(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255
    ] : [0, 0, 0, 255];
}

function clearSelection() {
    const selected = legendBar.querySelector('.legend-segment.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
    selectedSegmentIndex = null;
}

function closeColorPicker() {
    colorPickerPopup.classList.add('hidden');
    clearSelection();
}

function openColorPicker(segment, index, rgba) {
    clearSelection();

    segment.classList.add('selected');
    selectedSegmentIndex = index;

    // Set picker value
    colorPickerInput.value = rgbaToHex(rgba);

    // Position picker next to segment
    const segmentRect = segment.getBoundingClientRect();
    const legendRect = legendContainer.getBoundingClientRect();

    colorPickerPopup.classList.remove('hidden');

    // Position to the right of the legend
    colorPickerPopup.style.left = `${legendRect.right + 10}px`;
    colorPickerPopup.style.top = `${segmentRect.top}px`;
}

// Close button handler
colorPickerClose.addEventListener('click', closeColorPicker);

// Color change handler
colorPickerInput.addEventListener('change', (event) => {
    if (selectedSegmentIndex === null) return;

    const newColor = hexToRgba(event.target.value);

    // Dispatch event with index and new color
    document.dispatchEvent(new CustomEvent('color-edit', {
        detail: { index: selectedSegmentIndex, color: newColor }
    }));

    closeColorPicker();
});

export function updateLegend(colorMap, thresholds, units, isDefault) {
    // Close picker if open (colors are changing)
    closeColorPicker();

    // Update title (units)
    legendTitle.textContent = units || '';

    // Build color segments (skip first and last colorMap entries which are -Infinity/+Infinity)
    const colorSegments = colorMap.slice(1, -1);

    legendBar.innerHTML = colorSegments.map((entry, index) => {
        const [r, g, b, a] = entry.rgba;
        return `<div class="legend-segment" data-index="${index}" style="background-color: rgba(${r},${g},${b},${a / 255});"></div>`;
    }).join('');

    // Add click handlers to segments
    legendBar.querySelectorAll('.legend-segment').forEach(segment => {
        segment.addEventListener('click', () => {
            const index = parseInt(segment.dataset.index, 10);
            const rgba = colorSegments[index].rgba;
            openColorPicker(segment, index, rgba);
        });
    });

    // Determine which threshold labels to show
    const labelIndices = getLabelIndices(thresholds.length, isDefault);

    // Build labels
    legendLabels.innerHTML = labelIndices.map(index => {
        const value = thresholds[index];
        return `<span class="legend-label" data-index="${index}">${formatValue(value)}</span>`;
    }).join('');

    showLegend();
}