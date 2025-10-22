document.addEventListener('DOMContentLoaded', () => {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.5, lng: -98.35 },
        zoom: 5,
        minZoom: 5,
        maxZoom: 12,
    });
});