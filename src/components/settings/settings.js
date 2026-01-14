import './settings.css';

const timezoneRadios = document.querySelectorAll('input[name="timezone"]');

timezoneRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.dispatchEvent(new CustomEvent('timezone-change', {
            detail: { timezone: radio.value }
        }));
    });
});