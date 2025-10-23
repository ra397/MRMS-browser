import { grib2class } from "./grib2/grib2.js";

document.addEventListener('decode-files', event => {
    function pngDecoder (imageBytes) {
        return fastPng.decode(imageBytes).data.slice(0);
    }

    const grib_message = new grib2class(
        {
            log: false,
            numMembers: 1,
            pngDecoder: pngDecoder,
        }
    )

    for (const rawData of event.detail) {
        grib_message.parse(new Uint8Array(rawData));
        console.log(grib_message.data);
    }
});