import "./mapType.css";

const mapTypeRadios = document.querySelectorAll('input[name="map-type"]');

mapTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.dispatchEvent(new CustomEvent('map-type-change', {
            detail: { mapType: radio.value }
        }));
    });
});