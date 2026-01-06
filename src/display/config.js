const millimetersColoMap = [
    { min: -Infinity, max: 0.25, rgba: [0, 0, 0, 0] },
    { min: 0.25, max: 1.27, rgba: [0, 236, 236, 255] },
    { min: 1.27, max: 2.54, rgba: [0, 200, 240, 255] },
    { min: 2.54, max: 3.81, rgba: [0, 160, 255, 255] },
    { min: 3.81, max: 5.08, rgba: [0, 60, 255, 255] },
    { min: 5.08, max: 10.16, rgba: [0, 255, 0, 255] },
    { min: 10.16, max: 15.24, rgba: [0, 220, 0, 255] },
    { min: 15.24, max: 20.32, rgba: [0, 190, 0, 255] },
    { min: 20.32, max: 25.40, rgba: [0, 141, 0, 255] },
    { min: 25.40, max: 31.75, rgba: [255, 255, 0, 255] },
    { min: 31.75, max: 38.10, rgba: [240, 210, 0, 255] },
    { min: 38.10, max: 44.45, rgba: [231, 180, 0, 255] },
    { min: 44.45, max: 50.80, rgba: [200, 120, 0, 255] },
    { min: 50.80, max: 63.50, rgba: [255, 160, 160, 255] },
    { min: 63.50, max: 76.20, rgba: [255, 60, 60, 255] },
    { min: 76.20, max: 88.90, rgba: [230, 0, 0, 255] },
    { min: 88.90, max: 101.60, rgba: [180, 0, 0, 255] },
    { min: 101.60, max: 114.30, rgba: [255, 0, 255, 255] },
    { min: 114.30, max: 127.00, rgba: [217, 0, 217, 255] },
    { min: 127.00, max: 139.70, rgba: [164, 0, 164, 255] },
    { min: 139.70, max: 152.40, rgba: [120, 0, 120, 255] },
    { min: 152.40, max: 165.10, rgba: [255, 255, 255, 255] },
    { min: 165.10, max: 177.80, rgba: [192, 192, 255, 255] },
    { min: 177.80, max: 203.20, rgba: [192, 255, 255, 255] },
    { min: 203.20, max: Infinity, rgba: [255, 255, 192, 255] }
];

const qualityIndexColorMap = [
    { min: -Infinity, max: 1001, rgba: [0, 0, 0, 0] },           // < 0
    { min: 1001, max: 1050, rgba: [0, 0, 255, 255] },            // 0 to 0.05
    { min: 1050, max: 1100, rgba: [0, 67, 241, 255] },           // 0.05 to 0.1
    { min: 1100, max: 1150, rgba: [0, 100, 227, 255] },          // 0.1 to 0.15
    { min: 1150, max: 1200, rgba: [0, 150, 213, 255] },          // 0.15 to 0.2
    { min: 1200, max: 1250, rgba: [0, 200, 200, 255] },          // 0.2 to 0.25
    { min: 1250, max: 1300, rgba: [0, 218, 134, 255] },          // 0.25 to 0.3
    { min: 1300, max: 1350, rgba: [0, 237, 67, 255] },           // 0.3 to 0.35
    { min: 1350, max: 1400, rgba: [0, 255, 0, 255] },            // 0.35 to 0.4
    { min: 1400, max: 1450, rgba: [120, 255, 0, 255] },          // 0.4 to 0.45
    { min: 1450, max: 1500, rgba: [180, 255, 0, 255] },          // 0.45 to 0.5
    { min: 1500, max: 1550, rgba: [217, 255, 0, 255] },          // 0.5 to 0.55
    { min: 1550, max: 1600, rgba: [255, 255, 0, 255] },          // 0.55 to 0.6
    { min: 1600, max: 1650, rgba: [255, 208, 0, 255] },          // 0.6 to 0.65
    { min: 1650, max: 1700, rgba: [255, 140, 0, 255] },          // 0.65 to 0.7
    { min: 1700, max: 1750, rgba: [255, 0, 0, 255] },            // 0.7 to 0.75
    { min: 1750, max: 1800, rgba: [235, 0, 200, 255] },          // 0.75 to 0.8
    { min: 1800, max: 1850, rgba: [210, 0, 235, 255] },          // 0.8 to 0.85
    { min: 1850, max: 1900, rgba: [185, 0, 255, 255] },          // 0.85 to 0.9
    { min: 1900, max: 1950, rgba: [160, 0, 255, 255] },          // 0.9 to 0.95
    { min: 1950, max: 2000, rgba: [120, 0, 225, 255] },          // 0.95 to 1.0
    { min: 2000, max: Infinity, rgba: [120, 0, 225, 255] }       // > 1.0
];

const echoTopColorMap = [
    { min: -Infinity, max: 2001, rgba: [0, 0, 0, 0] },
    { min: 2001, max: 4000, rgba: [0, 236, 236, 255] },
    { min: 4000, max: 6000, rgba: [0, 200, 240, 255] },
    { min: 6000, max: 8000, rgba: [0, 160, 255, 255] },
    { min: 8000, max: 10000, rgba: [0, 60, 255, 255] },
    { min: 10000, max: 12000, rgba: [0, 255, 0, 255] },
    { min: 12000, max: 14000, rgba: [0, 220, 0, 255] },
    { min: 14000, max: 16000, rgba: [0, 190, 0, 255] },
    { min: 16000, max: 18000, rgba: [0, 141, 0, 255] },
    { min: 18000, max: 20000, rgba: [255, 255, 0, 255] },
    { min: 20000, max: 22000, rgba: [240, 210, 0, 255] },
    { min: 22000, max: 24000, rgba: [231, 180, 0, 255] },
    { min: 24000, max: 26000, rgba: [200, 120, 0, 255] },
    { min: 26000, max: 28000, rgba: [255, 160, 160, 255] },
    { min: 28000, max: 30000, rgba: [255, 60, 60, 255] },
    { min: 30000, max: 32000, rgba: [230, 0, 0, 255] },
    { min: 32000, max: 34000, rgba: [180, 0, 0, 255] },
    { min: 34000, max: 36000, rgba: [255, 0, 255, 255] },
    { min: 36000, max: 38000, rgba: [217, 0, 217, 255] },
    { min: 38000, max: 40000, rgba: [164, 0, 164, 255] },
    { min: 40000, max: Infinity, rgba: [120, 0, 120, 255] }
];

const gaugeInfluenceIndexColorMap = [
    { min: -Infinity, max: 3001, rgba: [0, 0, 0, 0] },
    { min: 3001, max: 3050, rgba: [0, 236, 236, 255] },
    { min: 3050, max: 3100, rgba: [0, 200, 240, 255] },
    { min: 3100, max: 3150, rgba: [0, 160, 255, 255] },
    { min: 3150, max: 3200, rgba: [0, 60, 255, 255] },
    { min: 3200, max: 3250, rgba: [0, 255, 0, 255] },
    { min: 3250, max: 3300, rgba: [0, 210, 0, 255] },
    { min: 3300, max: 3350, rgba: [0, 180, 0, 255] },
    { min: 3350, max: 3400, rgba: [0, 144, 0, 255] },
    { min: 3400, max: 3450, rgba: [255, 255, 0, 255] },
    { min: 3450, max: 3500, rgba: [240, 210, 0, 255] },
    { min: 3500, max: 3550, rgba: [240, 180, 0, 255] },
    { min: 3550, max: 3600, rgba: [240, 110, 0, 255] },
    { min: 3600, max: 3650, rgba: [255, 160, 160, 255] },
    { min: 3650, max: 3700, rgba: [255, 20, 20, 255] },
    { min: 3700, max: 3750, rgba: [220, 0, 0, 255] },
    { min: 3750, max: 3800, rgba: [180, 0, 0, 255] },
    { min: 3800, max: 3850, rgba: [255, 0, 255, 255] },
    { min: 3850, max: 3900, rgba: [200, 0, 200, 255] },
    { min: 3900, max: 3950, rgba: [130, 0, 130, 255] },
    { min: 3950, max: Infinity, rgba: [255, 255, 255, 255] }
];

const flagMap = [
    { min: -Infinity, max: 1, rgba: [0, 0, 0, 0] },
    { min: 1, max: 2, rgba: [4, 80, 164, 255] },
    { min: 3, max: 4, rgba: [255, 255, 255, 255] },
    { min: 6, max: 7, rgba: [255, 50, 50, 255] },
    { min: 7, max: 8, rgba: [150, 0, 150, 255] },
    { min: 10, max: 11, rgba: [110, 255, 255, 255] },
    { min: 91, max: 92, rgba: [0, 249, 0, 255] },
    { min: 96, max: 97, rgba: [0, 151, 0, 255] },
];

const freezingHeightColorMap = [
    { min: -Infinity, max: 3.01, rgba: [0, 0, 0, 0] },
    { min: 3.01, max: 500, rgba: [0, 236, 236, 255] },
    { min: 500, max: 1000, rgba: [0, 200, 240, 255] },
    { min: 1000, max: 1500, rgba: [0, 160, 255, 255] },
    { min: 1500, max: 2000, rgba: [0, 60, 255, 255] },
    { min: 2000, max: 2500, rgba: [0, 255, 0, 255] },
    { min: 2500, max: 3000, rgba: [0, 220, 0, 255] },
    { min: 3000, max: 3500, rgba: [0, 190, 0, 255] },
    { min: 3500, max: 4000, rgba: [0, 141, 0, 255] },
    { min: 4000, max: 4500, rgba: [255, 255, 0, 255] },
    { min: 4500, max: 5000, rgba: [240, 210, 0, 255] },
    { min: 5000, max: 5500, rgba: [231, 180, 0, 255] },
    { min: 5500, max: 6000, rgba: [200, 120, 0, 255] },
    { min: 6000, max: 6500, rgba: [255, 160, 160, 255] },
    { min: 6500, max: 7000, rgba: [255, 60, 60, 255] },
    { min: 7000, max: 7500, rgba: [230, 0, 0, 255] },
    { min: 7500, max: 8000, rgba: [180, 0, 0, 255] },
    { min: 8000, max: 8500, rgba: [255, 0, 255, 255] },
    { min: 8500, max: 9000, rgba: [217, 0, 217, 255] },
    { min: 9000, max: 9500, rgba: [164, 0, 164, 255] },
    { min: 9500, max: 10000, rgba: [120, 0, 120, 255] }
];

const warmRainProbabilityColorMap = [
    { min: -Infinity, max: 3.01, rgba: [0, 0, 0, 0] },
    { min: 3.01, max: 10, rgba: [0, 236, 236, 255] },
    { min: 10, max: 20, rgba: [0, 160, 246, 255] },
    { min: 20, max: 30, rgba: [0, 0, 246, 255] },
    { min: 30, max: 40, rgba: [0, 255, 0, 255] },
    { min: 40, max: 50, rgba: [0, 200, 0, 255] },
    { min: 50, max: 60, rgba: [0, 144, 0, 255] },
    { min: 60, max: 70, rgba: [255, 255, 0, 255] },
    { min: 70, max: 80, rgba: [231, 192, 0, 255] },
    { min: 80, max: 90, rgba: [255, 144, 0, 255] },
    { min: 90, max: 100, rgba: [254, 0, 0, 255] },
    { min: 100, max: Infinity, rgba: [254, 0, 0, 255] }
];

const decibelsColorMap = [
    { min: -Infinity, max: -35, rgba: [0, 0, 0, 0] },
    { min: -35, max: -30, rgba: [221, 254, 255, 255] },
    { min: -30, max: -25, rgba: [216, 210, 233, 255] },
    { min: -25, max: -20, rgba: [208, 175, 212, 255] },
    { min: -20, max: -15, rgba: [163, 127, 167, 255] },
    { min: -15, max: -10, rgba: [115, 74, 119, 255] },
    { min: -10, max: -5, rgba: [214, 212, 173, 255] },
    { min: -5, max: 0, rgba: [169, 168, 125, 255] },
    { min: 0, max: 5, rgba: [119, 119, 119, 255] },
    { min: 5, max: 10, rgba: [0, 236, 236, 255] },
    { min: 10, max: 15, rgba: [1, 160, 246, 255] },
    { min: 15, max: 20, rgba: [0, 0, 246, 255] },
    { min: 20, max: 25, rgba: [0, 255, 0, 255] },
    { min: 25, max: 30, rgba: [0, 200, 0, 255] },
    { min: 30, max: 35, rgba: [0, 144, 0, 255] },
    { min: 35, max: 40, rgba: [255, 255, 0, 255] },
    { min: 40, max: 45, rgba: [231, 192, 0, 255] },
    { min: 45, max: 50, rgba: [255, 144, 0, 255] },
    { min: 50, max: 55, rgba: [255, 0, 0, 255] },
    { min: 55, max: 60, rgba: [220, 0, 0, 255] },
    { min: 60, max: 65, rgba: [192, 0, 0, 255] },
    { min: 65, max: 70, rgba: [255, 0, 255, 255] },
    { min: 70, max: 75, rgba: [153, 85, 201, 255] },
    { min: 75, max: Infinity, rgba: [153, 85, 201, 255] }
];

export const overlayInfo = {
    bbox: {
        "sw": {
            "lng": -130.004188,
            "lat": 21.101622
        },
        "ne": {
            "lng": -60.869844,
            "lat": 52.636275
        }
    },
    numCols: 1924,
    numRows: 1128,
    transparentImgSrc: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z/" +
        "CfAQADgwGf6tJVEwAAAABJRU5ErkJggg==",
}

export const productGroups = [
    {
        name: "QPE",
        type: "category",
        items: [
            {
                name: "Q3 Multi-Sensor",
                type: "subcategory",
                items: [
                    { display_name: "Q3 Multi-Sensor 1 hr (Pass 1)", s3_name: "MultiSensor_QPE_01H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 3 hr (Pass 1)", s3_name: "MultiSensor_QPE_03H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 6 hr (Pass 1)", s3_name: "MultiSensor_QPE_06H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 12 hr (Pass 1)", s3_name: "MultiSensor_QPE_12H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 24 hr (Pass 1)", s3_name: "MultiSensor_QPE_24H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 48 hr (Pass 1)", s3_name: "MultiSensor_QPE_48H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 72 hr (Pass 1)", s3_name: "MultiSensor_QPE_72H_Pass1_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 1 hr (Pass 2)", s3_name: "MultiSensor_QPE_01H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 3 hr (Pass 2)", s3_name: "MultiSensor_QPE_03H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 6 hr (Pass 2)", s3_name: "MultiSensor_QPE_06H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 12 hr (Pass 2)", s3_name: "MultiSensor_QPE_12H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 24 hr (Pass 2)", s3_name: "MultiSensor_QPE_24H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 48 hr (Pass 2)", s3_name: "MultiSensor_QPE_48H_Pass2_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Multi-Sensor 72 hr (Pass 2)", s3_name: "MultiSensor_QPE_72H_Pass2_00.00", color_map: millimetersColoMap },
                ]
            },
            {
                name: "Q3 Radar Only",
                type: "subcategory",
                items: [
                    { display_name: "Q3 Radar Only 15 min", s3_name: "RadarOnly_QPE_15M_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 1 hr", s3_name: "RadarOnly_QPE_01H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 3 hr", s3_name: "RadarOnly_QPE_03H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 6 hr", s3_name: "RadarOnly_QPE_06H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 12 hr", s3_name: "RadarOnly_QPE_12H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 24 hr", s3_name: "RadarOnly_QPE_24H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 48 hr", s3_name: "RadarOnly_QPE_48H_00.00", color_map: millimetersColoMap },
                    { display_name: "Q3 Radar Only 72 hr", s3_name: "RadarOnly_QPE_72H_00.00", color_map: millimetersColoMap },
                ]
            }
        ]
    },
    {
        name: "Reflectivity",
        type: "category",
        items: [
            {
                name: "Base Reflectivity",
                type: "subcategory",
                items: [
                    { display_name: "Base Reflectivity", s3_name: "MergedBaseReflectivity_00.50", color_map: decibelsColorMap },
                    { display_name: "Base Reflectivity (Quality Control)", s3_name: "MergedBaseReflectivityQC_00.50", color_map: decibelsColorMap },
                ]
            },
            {
                name: "Layer Reflectivity",
                type: "subcategory",
                items: [
                    { display_name: "Layer Reflectivity ANC", s3_name: "LayerCompositeReflectivity_ANC_00.50", color_map: decibelsColorMap },
                    { display_name: "Layer Reflectivity Low (0 - 24,000 ft)", s3_name: "LayerCompositeReflectivity_Low_00.50", color_map: decibelsColorMap },
                    { display_name: "Layer Reflectivity High (24,000 - 60,000 ft)", s3_name: "LayerCompositeReflectivity_High_00.50", color_map: decibelsColorMap },
                    { display_name: "Layer Reflectivity Super (33,000 - 60,000 ft)", s3_name: "LayerCompositeReflectivity_Super_00.50", color_map: decibelsColorMap },
                ]
            },
            {
                name: "Lowest Altitude Reflectivity",
                type: "subcategory",
                items: [
                    { display_name: "Reflectivity at Lowest Altitude", s3_name: "ReflectivityAtLowestAltitude_00.50", color_map: decibelsColorMap },
                    { display_name: "Merged Reflectivity At Lowest Altitude", s3_name: "MergedReflectivityAtLowestAltitude_00.50", color_map: decibelsColorMap },
                ]
            }
        ]
    },
    {
        name: "Echo Top",
        type: "category",
        items: [
            { display_name: "Echo Top 18 dBZ", s3_name: "EchoTop_18_00.50", color_map: echoTopColorMap },
            { display_name: "Echo Top 30 dBZ", s3_name: "EchoTop_30_00.50", color_map: echoTopColorMap },
            { display_name: "Echo Top 50 dBZ", s3_name: "EchoTop_50_00.50", color_map: echoTopColorMap },
            { display_name: "Echo Top 60 dBZ", s3_name: "EchoTop_60_00.50", color_map: echoTopColorMap },
        ]
    },
    {
        name: "Radar Accumulation Quality Index",
        type: "category",
        items: [
            { display_name: "QPE RQI 1 hr", s3_name: "RadarAccumulationQualityIndex_01H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 3 hr", s3_name: "RadarAccumulationQualityIndex_03H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 6 hr", s3_name: "RadarAccumulationQualityIndex_06H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 12 hr", s3_name: "RadarAccumulationQualityIndex_12H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 24 hr", s3_name: "RadarAccumulationQualityIndex_24H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 48 hr", s3_name: "RadarAccumulationQualityIndex_48H_00.00", color_map: qualityIndexColorMap },
            { display_name: "QPE RQI 72 hr", s3_name: "RadarAccumulationQualityIndex_72H_00.00", color_map: qualityIndexColorMap },
        ]
    },
    {
        name: "Gauge Influence Index",
        type: "category",
        items: [
            { display_name: "Gauge Influence Index 1 hr (Pass 1)", s3_name: "GaugeInflIndex_01H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 3 hr (Pass 1)", s3_name: "GaugeInflIndex_03H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 6 hr (Pass 1)", s3_name: "GaugeInflIndex_06H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 12 hr (Pass 1)", s3_name: "GaugeInflIndex_12H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 48 hr (Pass 1)", s3_name: "GaugeInflIndex_48H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 72 hr (Pass 1)", s3_name: "GaugeInflIndex_72H_Pass1_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 1 hr (Pass 2)", s3_name: "GaugeInflIndex_01H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 3 hr (Pass 2)", s3_name: "GaugeInflIndex_03H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 6 hr (Pass 2)", s3_name: "GaugeInflIndex_06H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 12 hr (Pass 2)", s3_name: "GaugeInflIndex_12H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 48 hr (Pass 2)", s3_name: "GaugeInflIndex_48H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
            { display_name: "Gauge Influence Index 72 hr (Pass 2)", s3_name: "GaugeInflIndex_72H_Pass2_00.00", color_map: gaugeInfluenceIndexColorMap },
        ]
    },
    {
        name: "Models",
        type: "category",
        items: [
            { display_name: "Model Freezing Height", s3_name: "Model_0degC_Height_00.50", color_map: freezingHeightColorMap },
            { display_name: "Warm Rain Probability", s3_name: "WarmRainProbability_00.50", color_map: warmRainProbabilityColorMap },
        ]
    }
];

export const products = (function flatten(groups) {
    let flat = [];
    groups.forEach(g => {
        if (g.items) {
            // Check if children are subcategories or direct items
            const hasSub = g.items.some(i => i.type === 'subcategory');
            if (hasSub) {
                // Dig deeper into subcategories
                g.items.forEach(sub => {
                    if (sub.items) flat = flat.concat(sub.items);
                });
            } else {
                // Direct items
                flat = flat.concat(g.items);
            }
        }
    });
    return flat;
})(productGroups);

globalThis.products = products;