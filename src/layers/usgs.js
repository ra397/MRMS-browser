import { MarkerCollection } from "./base/MarkerCollection.js";
import Pbf from 'pbf';
import geobuf from 'geobuf';
import { getMarkerSizeForZoom } from "../components/map/map.js";

// Initialize layer
let markers = null;
let sizeInput = null;
document.addEventListener("map-ready", async () => {
    markers = new MarkerCollection(map);
    markers.setColor("#008000");
    markers.setSize(getMarkerSizeForZoom(map.getZoom()));

    const response = await fetch("usgs_markers.pbf");
    const arrayBuffer = await response.arrayBuffer();
    const pbf = new Pbf(arrayBuffer);
    const geojson = geobuf.decode(pbf);

    for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];

        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const id = feature.properties['usgs_id'];

        const markerObj = markers.add(lat, lng, {
            id: id,
        });

        markerObj.marker.addListener('click', () => {
            // TODO: insert custom onclick event here
        });
    }

    markers.hide();

    // Add menu listeners
    const layerItemElement = document.querySelector('[data-layer="usgs"]');
    const toggle = layerItemElement.querySelector('.toggle-switch input');
    const colorInput = layerItemElement.querySelector('input[type="color"]');
    sizeInput = layerItemElement.querySelector('input[type="number"]');

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
});

document.addEventListener('map-zoom-changed', (e) => {
    const newSize = getMarkerSizeForZoom(e.detail.zoom);
    markers.setSize(newSize);

    // update value displayed in for size input
    sizeInput.value = newSize;
});