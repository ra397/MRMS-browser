import MarkerCollection from "./base/MarkerCollection.js";

let markers = null;
const MARKER_STYLE = '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6">' +
    '<circle cx="3" cy="3" r="3" fill="#FF0000" stroke="white" stroke-width="1.5"/></svg>';

document.addEventListener("map-ready", async () => {
    markers = new MarkerCollection(map, {
        style: MARKER_STYLE,
        selectedStyle: MARKER_STYLE,
    });

    const response = await fetch(`${import.meta.env.BASE_URL}data/nexrad.json`);
    const json = await response.json();

    for (const entry of json) {
        markers.add({
            lat: entry['lat'],
            lng: entry['lng'],
            id: entry['id'],
        });
    }

    markers.hideAll();

    // Add menu listeners
    const layerItemElement = document.querySelector('[data-layer="nexrad"]');
    const toggle = layerItemElement.querySelector('.toggle-switch input');

    toggle.addEventListener('change', (e) => {
        e.target.checked ? markers.showAll() : markers.hideAll();
    });
})