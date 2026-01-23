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

    const response = await fetch(`${import.meta.env.BASE_URL}data/usgs_markers.pbf`);
    const arrayBuffer = await response.arrayBuffer();
    const pbf = new Pbf(arrayBuffer);
    const geojson = geobuf.decode(pbf);

    for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];

        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const id = feature.properties['usgs_id'];
        const name = feature.properties['name'];

        const markerObj = markers.add(lat, lng, {
            id: id,
            name: name,
        });

        markerObj.marker.addListener('click', () => {
            if (currentBasin.id) {
                if (currentBasin.id === markerObj.properties.id) {
                    currentBasin.layer.setMap(null);
                    currentBasin.layer = null;
                    currentBasin.id = null;
                } else {
                    currentBasin.layer.setMap(null);
                    currentBasin.layer = null;
                    currentBasin.id = null;
                    showBasin(markerObj.properties.id);
                }
            } else {
                showBasin(markerObj.properties.id);
            }
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

    // Dispatch event for search component
    document.dispatchEvent(new CustomEvent('usgs-markers-ready', {
        detail: {
            markers: markers,
            toggle: toggle,
        }
    }));

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

const currentBasin = {
    layer: null,
    id: null,
};

async function showBasin(usgs_id) {
    const response = await fetch(`https://visualriver.net/wsr88/public/data/pbf_basins//${usgs_id}.pbf`);
    const arrayBuffer = await response.arrayBuffer();
    const geojson = geobuf.decode(new Pbf(new Uint8Array(arrayBuffer)));

    currentBasin.layer = new google.maps.Data({ map: map });
    currentBasin.layer.addGeoJson(geojson);
    currentBasin.layer.setStyle({
        fillColor: '#ccc',
        fillOpacity: 0.5,
        strokeColor: "black",
        strokeWeight: 1,
        clickable: false,
    });
    currentBasin.id = usgs_id;

    // Calculate bounds and fit the map to the basin
    const bounds = new google.maps.LatLngBounds();
    currentBasin.layer.forEach((feature) => {
        feature.getGeometry().forEachLatLng((latLng) => {
            bounds.extend(latLng);
        });
    });
    map.fitBounds(bounds);
}