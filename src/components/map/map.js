import './map.css';

const lightStyle = [{
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d2d2d2" }]
}, {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{ "color": "#f2f2f2" }]
}, {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
}, {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{ "visibility": "simplified" }]
}, {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
}];

const darkStyle = [{
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{ "color": "#202c3e" }]
}, {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "gamma": 0.01 }, { "lightness": 20 }, { "weight": "1.39" }, { "color": "#ffffff" }]
}, {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{ "weight": "0.96" }, { "saturation": "9" }, { "visibility": "on" }, { "color": "#000000" }]
}, {
    "featureType": "all",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "lightness": 30 }, { "saturation": "9" }, { "color": "#29446b" }]
}, {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "saturation": 20 }]
}, {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "lightness": 20 }, { "saturation": -20 }]
}, {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "lightness": 10 }, { "saturation": -30 }]
}, {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#193a55" }]
}, {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "saturation": 25 }, { "lightness": 25 }, { "weight": "0.01" }]
}, {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{ "lightness": -20 }]
}];

const standardStyle = [{
    "featureType": "road",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
}, {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{ "visibility": "off" }]
}];

const mapStyles = {
    light: lightStyle,
    dark: darkStyle,
    standard: standardStyle,
    satellite: null
};

document.addEventListener('DOMContentLoaded', () => {
    globalThis.map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 39.5, lng: -98.35},
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        clickableIcons: false,
    });

    map.addListener('zoom_changed', () => {
        document.dispatchEvent(new CustomEvent('map-zoom-changed', {
            detail: {
                zoom: map.getZoom(),
            }
        }));
    })

    google.maps.event.addListenerOnce(map, 'idle', () => {
        // Apply default light style
        map.setOptions({ styles: lightStyle });
        document.dispatchEvent(new CustomEvent('map-ready'));
    });
});

document.addEventListener('map-type-change', event => {
    const { mapType } = event.detail;

    if (mapType === 'satellite') {
        map.setMapTypeId('satellite');
    } else {
        map.setMapTypeId('roadmap');
        map.setOptions({ styles: mapStyles[mapType] });
    }
});

export function getMarkerSizeForZoom(zoom) {
    if (zoom <= 6) return 2;
    if (zoom <= 8) return 3.5;
    if (zoom <= 12) return 4.5;
    return 2.5;
}