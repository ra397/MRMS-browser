import './map.css';

document.addEventListener('DOMContentLoaded', () => {
    globalThis.map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 39.5, lng: -98.35},
        zoom: 4,
        minZoom: 4,
        maxZoom: 12,
    });

    map.addListener('zoom_changed', () => {
        document.dispatchEvent(new CustomEvent('map-zoom-changed', {
            detail: {
                zoom: map.getZoom(),
            }
        }));
    })

    document.dispatchEvent(new CustomEvent('map-ready'));
});

export function getMarkerSizeForZoom(zoom) {
    if (zoom <= 6) return 2;
    if (zoom <= 8) return 3.5;
    if (zoom <= 12) return 4.5;
    return 2.5;
}