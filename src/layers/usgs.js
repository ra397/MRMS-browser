import MarkerCollection from "./base/MarkerCollection.js";
import Pbf from 'pbf';
import geobuf from 'geobuf';

// Initialize layer
let markers = null;
const MARKER_STYLE = '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6">' +
    '<circle cx="3" cy="3" r="3" fill="#087151" stroke="white" stroke-width="1.5"/></svg>';
const SELECTED_MARKER_STYLE = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">' +
    '<circle cx="6" cy="6" r="5" fill="#e67e22" stroke="white" stroke-width="2"/></svg>';

document.addEventListener("map-ready", async () => {
    markers = new MarkerCollection(map, {
        style: MARKER_STYLE,
        selectedStyle: SELECTED_MARKER_STYLE,
        onClick: (marker) => {
            if (currentBasin.id) {
                if (currentBasin.id === marker.id) {
                    currentBasin.layer.setMap(null);
                    currentBasin.layer = null;
                    currentBasin.id = null;
                } else {
                    currentBasin.layer.setMap(null);
                    currentBasin.layer = null;
                    currentBasin.id = null;
                    showBasin(marker.id);
                }
            } else {
                showBasin(marker.id);
            }
            markers.select(marker.id);
        }
    });

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

        markers.add({
            id,
            name,
            lat,
            lng,
        });
    }

    markers.hideAll();

    // Add menu listeners
    const layerItemElement = document.querySelector('[data-layer="usgs"]');
    const toggle = layerItemElement.querySelector('.toggle-switch input');

    toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            markers.showAll();
        } else {
            markers.hideAll();
            // Close basin if one is open
            if (currentBasin.id) {
                currentBasin.layer.setMap(null);
                currentBasin.layer = null;
                currentBasin.id = null;
            }
        }
    });

    // Dispatch event for search component
    document.dispatchEvent(new CustomEvent('usgs-markers-ready', {
        detail: {
            markers: markers,
            toggle: toggle,
        }
    }));
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