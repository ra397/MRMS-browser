export class RasterOverlay {
    constructor(data, width, height, bbox, map, minValue, maxValue) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.bbox = bbox;
        this.map = map;
        this.minValue = minValue;
        this.maxValue = maxValue;

        this.overlay = new google.maps.OverlayView();
        this.overlay.onAdd = this.onAdd.bind(this);
        this.overlay.draw = this.draw.bind(this);
        this.overlay.setMap(map);
    }

    onAdd() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');

        // Use OffscreenCanvas if available
        if (typeof OffscreenCanvas !== 'undefined') {
            this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);
            this.offscreenContext = this.offscreenCanvas.getContext('2d');
        } else {
            this.offscreenCanvas = this.canvas;
            this.offscreenContext = this.context;
        }
    }

    draw() {
        const projection = this.overlay.getProjection();
        if (!projection) return;

        // Draw data to offscreen canvas
        const imageData = this.offscreenContext.createImageData(this.width, this.height);
        for (let i = 0; i < this.data.length; i++) {
            const value = this.data[i];
            // Normalize value based on min/max
            const normalized = Math.max(0, Math.min(1, (value - this.minValue) / (this.maxValue - this.minValue)));
            const grayscale = Math.floor((1 - normalized) * 255); // max value -> black
            imageData.data[i * 4] = grayscale;
            imageData.data[i * 4 + 1] = grayscale;
            imageData.data[i * 4 + 2] = grayscale;
            imageData.data[i * 4 + 3] = 255; // alpha
        }
        this.offscreenContext.putImageData(imageData, 0, 0);

        // Convert to visible canvas if using offscreen
        if (this.offscreenCanvas !== this.canvas) {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.drawImage(this.offscreenCanvas, 0, 0);
        }

        // Map the canvas to LatLngBounds
        const sw = new google.maps.LatLng(this.bbox.sw.lat, this.bbox.sw.lng);
        const ne = new google.maps.LatLng(this.bbox.ne.lat, this.bbox.ne.lng);
        const bounds = new google.maps.LatLngBounds(sw, ne);

        const overlayDiv = this.overlay.getPanes().overlayLayer;
        this.canvas.style.position = 'absolute';
        overlayDiv.appendChild(this.canvas);

        const swPixel = projection.fromLatLngToDivPixel(sw);
        const nePixel = projection.fromLatLngToDivPixel(ne);

        this.canvas.style.left = `${swPixel.x}px`;
        this.canvas.style.top = `${nePixel.y}px`;
        this.canvas.width = nePixel.x - swPixel.x;
        this.canvas.height = swPixel.y - nePixel.y;

        // Draw scaled image
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height);
    }
}