import { MarkerCollection } from "./base/MarkerCollection.js";

let markers = null;

document.addEventListener("map-ready", async () => {
    markers = new MarkerCollection(map);
    markers.setColor('#EF4444');
    markers.setSize(3.5);

    const response = await fetch(`${import.meta.env.BASE_URL}data/nexrad.json`);
    const json = await response.json();

    for (const entry of json) {
        const markerObj = markers.add(entry['lat'], entry['lng'], {
            id: entry['id'],
        });

        markerObj.marker.addListener('click', () => {
            // TODO: insert custom onclick event here
        });
    }

    markers.hide();

    // Add menu listeners
    const layerItemElement = document.querySelector('[data-layer="nexrad"]');
    const toggle = layerItemElement.querySelector('.toggle-switch input');
    const colorInput = layerItemElement.querySelector('input[type="color"]');
    const sizeInput = layerItemElement.querySelector('input[type="number"]');

    colorInput.value = markers.getColor();
    sizeInput.value = markers.getSize();

    toggle.addEventListener('change', (e) => {
        e.target.checked ? markers.show() : markers.hide();
    });

    colorInput.addEventListener('change', (e) => {
        markers.setColor(e.target.value);
    });

    sizeInput.addEventListener('input', (e) => {
        markers.setSize(parseFloat(e.target.value));
    });
})