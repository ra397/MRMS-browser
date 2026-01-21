import './doubleRangeSlider.js'; // double range slider functionality
import "./mrmsMenu.css";

// Palette Selection
const paletteRadioButtons = document.querySelectorAll('input[name="palette"]');

const dispatchPalette = (value) => {
    document.dispatchEvent(new CustomEvent('palette-set', {
        detail: { palette: value },
    }));
};
dispatchPalette(document.querySelector('input[name="palette"]:checked').value);

paletteRadioButtons.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.checked) {
            if (event.target.value === 'default') {
                // Reset numColors and range to defaults
                document.dispatchEvent(new CustomEvent('visualization-reset'));
            }
            dispatchPalette(event.target.value);
        }
    });
});

// Opacity Selection
const opacitySlider = document.getElementById("mrms-opacity");
const opacityLabel = document.getElementById("mrms-opacity-value-label");

const dispatchOpacity = (value) => {
    document.dispatchEvent(new CustomEvent('opacity-set', {
        detail: { opacity: value },
    }));
}

opacitySlider.addEventListener("change", (event) => {
    const value = event.target.value;
    opacityLabel.textContent = `${value}%`;
    dispatchOpacity(value);
});

// Number of Colors Selection
const colorCountInput = document.getElementById("mrms-color-count");

const dispatchColorCount = (value) => {
    document.dispatchEvent(new CustomEvent('colorcount-set', {
        detail: { colorCount: parseInt(value, 10) },
    }));
};

colorCountInput.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value && !isNaN(value)) {
        dispatchColorCount(value);
    }
});

// Range Selection
// Value Range Selection (Min/Max Thresholds)
const rangeMinSlider = document.getElementById("mrms-min");
const rangeMaxSlider = document.getElementById("mrms-max");
const rangeValueLabel = document.getElementById("mrms-range-value-label");
rangeValueLabel.textContent = "N/A";

const dispatchRange = (min, max) => {
    document.dispatchEvent(new CustomEvent('range-set', {
        detail: { min: parseFloat(min), max: parseFloat(max) },
    }));
};

const updateRangeLabel = () => {
    rangeValueLabel.textContent = `${rangeMinSlider.value} - ${rangeMaxSlider.value}`;
};

rangeMinSlider.addEventListener("input", (event) => {
    if (parseFloat(event.target.value) > parseFloat(rangeMaxSlider.value)) {
        event.target.value = rangeMaxSlider.value;
    }
    updateRangeLabel();
});

rangeMaxSlider.addEventListener("input", (event) => {
    if (parseFloat(event.target.value) < parseFloat(rangeMinSlider.value)) {
        event.target.value = rangeMinSlider.value;
    }
    updateRangeLabel();
});

rangeMinSlider.addEventListener("change", () => {
    dispatchRange(rangeMinSlider.value, rangeMaxSlider.value);
});

rangeMaxSlider.addEventListener("change", () => {
    dispatchRange(rangeMinSlider.value, rangeMaxSlider.value);
});

// Clear Button
const clearButton = document.getElementById("mrms-clear-btn");
clearButton.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent('mrms-clear'));
});