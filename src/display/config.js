const defaultColorMap = [
    { min: -Infinity, max: 32, rgba: [0, 0, 0, 0] },
    { min: 32, max: 63, rgba: [191, 255, 232, 255] },
    { min: 63, max: 127, rgba: [80, 209, 250, 255] },
    { min: 127, max: 254, rgba: [0, 166, 212, 255] },
    { min: 254, max: 508, rgba: [221, 255, 153, 255] },
    { min: 508, max: 762, rgba: [170, 255, 0, 255] },
    { min: 762, max: 1016, rgba: [82, 189, 0, 255] },
    { min: 1016, max: 1270, rgba: [255, 255, 111, 255] },
    { min: 1270, max: 1524, rgba: [246, 227, 0, 255] },
    { min: 1524, max: 1778, rgba: [230, 153, 0, 255] },
    { min: 1778, max: 2032, rgba: [240, 47, 34, 255] },
    { min: 2032, max: 2286, rgba: [171, 0, 0, 255] },
    { min: 2286, max: 2540, rgba: [171, 0, 0, 255] },
    { min: 2540, max: Infinity, rgba: [53, 37, 0, 255] },
];

export const products = {
    "Q3 Multi-Sensor 1 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 1 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_01H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 3 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 3 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_03H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 6 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 6 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_06H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 12 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 12 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_12H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 24 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 24 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_24H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 48 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 48 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_48H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    "Q3 Multi-Sensor 72 hr (Pass 1)": {
        display_name: "Q3 Multi-Sensor 72 hr (Pass 1)",
        s3_name: "MultiSensor_QPE_72H_Pass1_00.00",
        color_map: defaultColorMap,
    },
    // add more products here:
    // "Another Product Name": { ... },
};