(function () {

    function createClass(name, rules) {
        const style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        if (!(style.sheet || {}).insertRule)
            (style.styleSheet || style.sheet).addRule(name, rules);
        else
            style.sheet.insertRule(name + "{" + rules + "}", 0);
    }

    createClass('.overlayDiv', "position: absolute; border-style: none; border-width: 0px; image-rendering: pixelated;");
    createClass('.overlayImg', "position: absolute; width: 100%; height: 100%;");


    function initOverlays() {
        // ---- GroundOverlay wrapper (don’t subclass GroundOverlay directly) ----
        function geoOverlay(image, bounds, map) {
            // Normalize bounds if passed as { sw, ne }
            if (
                !(bounds instanceof google.maps.LatLngBounds) &&
                bounds && 'sw' in bounds && 'ne' in bounds
            ) {
                bounds = new google.maps.LatLngBounds(bounds.sw, bounds.ne);
            }

            const overlay = new google.maps.GroundOverlay(image, bounds);
            overlay.setMap(map);

            overlay.remove = function () {
                overlay.setMap(null);
            };

            overlay.setSource = function (src) {
                // GroundOverlay reads the 'url' property; setting & re-adding refreshes drawing
                overlay.set('url', src);
                overlay.setMap(map);
            };

            overlay.animate = overlay.setSource;

            return overlay;
        }

        function MercatorOverlay(image, bounds, map) {
            // Store state
            this._bounds_ = bounds;
            this._div_ = document.createElement('div');
            this._div_.className = 'overlayDiv';

            this._img_ = new Image();
            this._img_.className = 'overlayImg';
            this._img_.src = image;
            this._div_.appendChild(this._img_);

            this.style = this._div_.style;

            // Optional: cache after first measure
            this.naturalHeight = undefined;
            this.naturalWidth = undefined;

            // Normalize bounds if passed as { sw, ne }
            if (
                !(this._bounds_ instanceof google.maps.LatLngBounds) &&
                this._bounds_ && 'sw' in this._bounds_ && 'ne' in this._bounds_
            ) {
                this._bounds_ = new google.maps.LatLngBounds(this._bounds_.sw, this._bounds_.ne);
            }

            // Attach to map
            this.setMap(map);
        }

        // Proper inheritance: AFTER Google is available
        MercatorOverlay.prototype = Object.create(google.maps.OverlayView.prototype);
        MercatorOverlay.prototype.constructor = MercatorOverlay;

        MercatorOverlay.prototype.onAdd = function () {
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this._div_);
            // Cache projection
            this.projection = this.getProjection();
        };

        MercatorOverlay.prototype.draw = function () {
            const sw = this.projection.fromLatLngToDivPixel(this._bounds_.getSouthWest());
            const ne = this.projection.fromLatLngToDivPixel(this._bounds_.getNorthEast());

            this.style.left = sw.x + 'px';
            this.style.top = ne.y + 'px';
            this.style.width = (ne.x - sw.x) + 'px';
            this.style.height = (sw.y - ne.y) + 'px';
        };

        MercatorOverlay.prototype.onRemove = function () {
            if (this._div_ && this._div_.parentNode) {
                this._div_.parentNode.removeChild(this._div_);
            }
            this._div_ = null;
        };

        MercatorOverlay.prototype.remove = function () {
            this.setMap(null);
        };

        MercatorOverlay.prototype.setOpacity = function (opacity) {
            this.style.opacity = opacity;
        };

        MercatorOverlay.prototype.setSource = function (src) {
            this._img_.src = src;
        };

        MercatorOverlay.prototype.animate = MercatorOverlay.prototype.setSource;

        MercatorOverlay.prototype.fromLatLngToColRow = function (_latLng) {
            if (!this._bounds_.contains(_latLng)) return [null, null];

            // Ensure natural sizes are available (image may not be loaded instantly)
            const nW = this._img_.naturalWidth, nH = this._img_.naturalHeight;
            this.naturalHeight = nH;
            this.naturalWidth = nW;

            const oL = this._div_.offsetLeft, oT = this._div_.offsetTop;
            const oW = this._div_.offsetWidth, oH = this._div_.offsetHeight;
            const xy = this.projection.fromLatLngToDivPixel(_latLng);

            const rW = nW / oW, rH = nH / oH;
            const col = Math.floor(Math.abs(oL - xy.x) * rW);
            const row = Math.floor(Math.abs(oT - xy.y) * rH);
            return [col, row];
        };

        function customOverlay(imgSrc, bounds, map, overlayType) {
            if (overlayType === 'OverlayView') {
                return new MercatorOverlay(imgSrc, bounds, map);
            } else if (overlayType === 'GroundOverlay') {
                return geoOverlay(imgSrc, bounds, map);
            }
            return false;
        }


        window.geoOverlay = geoOverlay;
        window.mercatorOverlay = MercatorOverlay;
        window.CustomOverlay = customOverlay;
    }

    // Initialize now or wait for Google
    if (window.google && window.google.maps) {
        initOverlays();
    } else {
        // Wait for the signal from the Google Maps callback in your HTML
        window.addEventListener('gmaps-loaded', initOverlays, { once: true });
    }
})();