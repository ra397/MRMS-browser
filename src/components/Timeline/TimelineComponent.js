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
        cssLink.setAttribute("href", "src/components/Timeline/timeline.css");
        shadow.appendChild(cssLink);

        const timeline = new Timeline(shadow.getElementById('timeline'),
            shadow.getElementById('start-marker'),
            shadow.getElementById('stop-marker'));

        const timelineController = new TimelineController(timeline, shadow.getElementById('timeline'));
    }
}
customElements.define('interval-selector', TimelineComponent);