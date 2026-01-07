import './doubleRangeSlider.js'; // double range slider functionality
import "./mrmsMenu.css";

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