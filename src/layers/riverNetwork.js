import { VectorTileLayer } from "./base/VectorTileLayer.js";

document.addEventListener("map-ready", () => {
    const riverLayer = new VectorTileLayer(map, {
        name: 'River Network',
        urlTemplate: (zxy) => `https://visualriver.net/api-common/tile?name=nhd-usgs-connect&zxy=/${zxy}`,
        extent: { west: -124.642, south: 25.41, east: -67.058, north: 49.364 },
        minZoom: 4,
        maxZoom: 12,
        style: {
            strokeColor: '#46bcec',
            strokeWeight: 2,
            strokeOpacity: 0.8
        },
    });

    riverLayer.show();
});