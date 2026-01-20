import './settings.css';
import { unitSystem } from '../../utils/unitConversion.js';

const timezoneRadios = document.querySelectorAll('input[name="timezone"]');

timezoneRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.dispatchEvent(new CustomEvent('timezone-change', {
            detail: { timezone: radio.value }
        }));
    });
});

const unitSystemRadios = document.querySelectorAll('input[name="unit-system"]');

unitSystemRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        unitSystem.set(radio.value);
    });
});