let LUT = null;
(async function () {
    try {
        // Load LUT
        const response = await fetch("MRMS_LUT.json");
        LUT = await response.json();

        // Convert "mrms_1d_ix" from base64 string to typed array
        const dataUri = atob(LUT.mrms_1d_ix);
        const bytes = new Uint8Array(dataUri.length);
        for (let i = 0; i < dataUri.length; i++) bytes[i] = dataUri.charCodeAt(i);
        LUT.mrms_1d_ix = new Int32Array(bytes.buffer);

        // Expose so it can be used by decode.js
        window.LUT = LUT;
    } catch (e) {
        console.error(e);
    }
})();