import './layersMenu.css';

function toggleLayer(element) {
    const parentItem = element.closest('.layer-item');

    const wasActive = parentItem.classList.contains('active');

    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('active');
    });

    if (!wasActive) {
        parentItem.classList.add('active');
    }
}

globalThis.toggleLayer = toggleLayer; // must be accessible to index.html