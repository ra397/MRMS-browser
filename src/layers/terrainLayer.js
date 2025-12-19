import { TileLayer } from './TileLayer.js';

const terrainLayer = new TileLayer({
    name: 'Terrain',
    urlTemplate: (x, y, z) => `https://visualriver.net/api-common/tile?name=hillshade&zxy=/${z}/${x}/${y}`
});


document.addEventListener('map-ready', () => {
    const layerItemElement = document.querySelector('[data-layer="terrain"]');
    const toggle = layerItemElement.querySelector('.toggle-switch input');

    toggle.addEventListener('change', (e) => {
        e.target.checked ? terrainLayer.setMap(map) : terrainLayer.setMap(null);
    });
});