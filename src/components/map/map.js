document.addEventListener('DOMContentLoaded', () => {
    window.map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 39.5, lng: -98.35},
        zoom: 4,
        minZoom: 4,
        maxZoom: 12,
    });
});