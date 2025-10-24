export class RasterGenerator {
    constructor(data, width, height) {
        this.canvas = new OffscreenCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');

        this.data = data;
        this.width = width;
        this.height = height;
    }

    drawRaster() {
        const imageData = this.ctx.createImageData(this.width, this.height);

        for (let i = 0; i < this.data.length; i++) {
            const value = this.data[i];
            const normalized = Math.max(0, Math.min(1, (value - 0) / (100 - 0)));
            const grayscale = Math.floor((1 - normalized) * 255);

            const j = i * 4;
            imageData.data[j] = grayscale;
            imageData.data[j + 1] = grayscale;
            imageData.data[j + 2] = grayscale;
            imageData.data[j + 3] = 255;
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    async toBlob() {
        this.drawRaster();
        return await this.canvas.convertToBlob({ type: 'image/png' });
    }

    async generateUrl() {
        const blob = await this.toBlob();
        return URL.createObjectURL(blob);
    }

    async download(filename) {
        const url = await this.generateUrl();
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();
    }
}