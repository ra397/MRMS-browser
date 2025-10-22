import './Timeline.js'
import './TimelineController.js'

class TimelineComponent extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
        <div id="timeline-container">
            <svg id="start-marker" viewBox='0 0 1 1'><polygon points='0,0 1,0 0.5,1' fill='green'/></svg>
            <svg id="stop-marker" viewBox='0 0 1 1'><polygon points='0,0 1,0 0.5,1' fill='red'/></svg>
            <div id="line"></div>
            <div id="timeline">
            <!-- units will be inserted here -->
            </div>
        </div>
        `;

        // add timeline.css
        const cssLink = document.createElement("link");
        cssLink.setAttribute("rel", "stylesheet");
        cssLink.setAttribute("href", "src/components/timeline/timeline.css");
        shadow.appendChild(cssLink);

        const today = new Date();
        const startDate = new Date(today);
        startDate.setHours(today.getHours() - 6);

        const timeline = new Timeline(
            shadow.getElementById('timeline'),
            shadow.getElementById('start-marker'),
            shadow.getElementById('stop-marker'),
            {
                resolution: "hour",
                startDate: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours()),
            }
        );

        const timelineController = new TimelineController(timeline, shadow.getElementById('timeline'));

        timelineController.onRangeSelected(({ startDate, endDate }) => {
            this.dispatchEvent(new CustomEvent('time-selected', {
                bubbles: true,
                composed: true,
                detail: {
                    startDate,
                    endDate,
                },
            }))
        });
    }
}
customElements.define('interval-selector', TimelineComponent);