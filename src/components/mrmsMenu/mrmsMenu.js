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