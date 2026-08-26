import { ChronoSlider } from './Timeline/chronoslider.js';
import { extractTimestampFromKey } from '../../api/api.js';

const today = new Date();
const startDate = new Date(today);
startDate.setHours(today.getHours() - 6);

const timeline = new ChronoSlider(
    document.getElementById('timeline-container'),
    new Date(),
    'hour'
);

timeline.onRangeSelected((start, end) => {
    console.log('Range selected:', start, end);
    document.dispatchEvent(new CustomEvent('time-selected', {
        detail: {
            start,
            end,
        },
    }))
})

// document.addEventListener('frame-changed', (event) => {
//     const { filename } = event.detail;
//     try {
//         const timestamp = extractTimestampFromKey(filename);
//         timeline.setCurrentFrameDate(timestamp);
//     } catch (e) {
//         timeline.clearCurrentFrameDate();
//     }
// });
//
// document.addEventListener('display-reset', () => {
//     timeline.clearCurrentFrameDate();
// });

document.getElementById('zoom-in-btn').addEventListener('click', () => {
    timeline.zoomIn();
});

document.getElementById('zoom-out-btn').addEventListener('click', () => {
    timeline.zoomOut();
});

document.addEventListener('timezone-change', (event) => {
    const { timezone } = event.detail;
    timeline.setTimezone(timezone);
});