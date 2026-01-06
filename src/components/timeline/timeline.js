import './Timeline/TimelineRenderer.js';
import './Timeline/TimelineController.js';
import './timeline.css';

const today = new Date();
const startDate = new Date(today);
startDate.setHours(today.getHours() - 6);

const timeline = new Timeline(
    document.getElementById('timeline'),
    document.getElementById('start-marker'),
    document.getElementById('stop-marker'),
    {
        resolution: "hour",
        startDate: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours()),
    }
);

const timelineController = new TimelineController(timeline, document.getElementById('timeline'));

timelineController.onRangeSelected(({ startDate, endDate }) => {
    document.dispatchEvent(new CustomEvent('time-selected', {
        detail: {
            startDate,
            endDate,
        },
    }))
});