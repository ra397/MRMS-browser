import { extractTimestampFromKey } from '../../api/api.js';
import './frameTimestamp.css';

const timestampEl = document.getElementById('frame-timestamp');

function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

document.addEventListener('frame-changed', (event) => {
    const { filename } = event.detail;
    try {
        const timestamp = extractTimestampFromKey(filename);
        timestampEl.textContent = formatTimestamp(timestamp);
        timestampEl.style.display = 'block';
    } catch (e) {
        timestampEl.textContent = '';
        timestampEl.style.display = 'none';
    }
});

document.addEventListener('display-reset', () => {
    timestampEl.textContent = '';
    timestampEl.style.display = 'none';
});