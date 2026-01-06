const millimetersThresholds = [0.25,1.27,2.54,3.81,5.08,10.16,15.24,20.32,25.40,31.75,38.10,44.45,50.80,63.50,76.20,88.90,101.60,114.30,127.00,139.70,152.40,165.10,177.80,203.20];
const millimetersDefaultColors = [[0,236,236,255],[0,200,240,255],[0,160,255,255],[0,60,255,255],[0,255,0,255],[0,220,0,255],[0,190,0,255],[0,141,0,255],[255,255,0,255],[240,210,0,255],[231,180,0,255],[200,120,0,255],[255,160,160,255],[255,60,60,255],[230,0,0,255],[180,0,0,255],[255,0,255,255],[217,0,217,255],[164,0,164,255],[120,0,120,255],[255,255,255,255],[192,192,255,255],[192,255,255,255],[255,255,192,255]];

const qualityIndexThresholds = [0.01,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,1.0];
const qualityIndexColors = [[0,0,255,255],[0,67,241,255],[0,100,227,255],[0,150,213,255],[0,200,200,255],[0,218,134,255],[0,237,67,255],[0,255,0,255],[120,255,0,255],[180,255,0,255],[217,255,0,255],[255,255,0,255],[255,208,0,255],[255,140,0,255],[255,0,0,255],[235,0,200,255],[210,0,235,255],[185,0,255,255],[160,0,255,255],[120,0,225,255]];

const echoTopThresholds = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
const echoTopColors = [[0,236,236,255],[0,200,240,255],[0,160,255,255],[0,60,255,255],[0,255,0,255],[0,220,0,255],[0,190,0,255],[0,141,0,255],[255,255,0,255],[240,210,0,255],[231,180,0,255],[200,120,0,255],[255,160,160,255],[255,60,60,255],[230,0,0,255],[180,0,0,255],[255,0,255,255],[217,0,217,255],[164,0,164,255],[120,0,120,255]];

const gaugeInfluenceIndexThresholds = [0,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95];
const gaugeInfluenceIndexColors = [[0,236,236,255],[0,200,240,255],[0,160,255,255],[0,60,255,255],[0,255,0,255],[0,210,0,255],[0,180,0,255],[0,144,0,255],[255,255,0,255],[240,210,0,255],[240,180,0,255],[240,110,0,255],[255,160,160,255],[255,20,20,255],[220,0,0,255],[180,0,0,255],[255,0,255,255],[200,0,200,255],[130,0,130,255],[255,255,255,255]];

const freezingHeightMetersThresholds = [3.01,500,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000];
const freezingHeightMetersColors = echoTopColors;

const warmRainProbabilityPercentageThresholds = [3.01,10,20,30,40,50,60,70,80,90,100];
const warmRainProbabilityPercentageColors = [[0,236,236,255],[0,160,246,255],[0,0,246,255],[0,255,0,255],[0,200,0,255],[0,144,0,255],[255,255,0,255],[231,192,0,255],[255,144,0,255],[254,0,0,255]];

const decibelThresholds = [-35,-30,-25,-20,-15,-10,-5,0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75];
const decibelColors = [[221,254,255,255],[216,210,233,255],[208,175,212,255],[163,127,167,255],[115,74,119,255],[214,212,173,255],[169,168,125,255],[119,119,119,255],[0,236,236,255],[1,160,246,255],[0,0,246,255],[0,255,0,255],[0,200,0,255],[0,144,0,255],[255,255,0,255],[231,192,0,255],[255,144,0,255],[255,0,0,255],[220,0,0,255],[192,0,0,255],[255,0,255,255],[153,85,201,255]];

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
                    { display_name: "Q3 Multi-Sensor 1 hr (Pass 1)", s3_name: "MultiSensor_QPE_01H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 3 hr (Pass 1)", s3_name: "MultiSensor_QPE_03H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 6 hr (Pass 1)", s3_name: "MultiSensor_QPE_06H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 12 hr (Pass 1)", s3_name: "MultiSensor_QPE_12H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 24 hr (Pass 1)", s3_name: "MultiSensor_QPE_24H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 48 hr (Pass 1)", s3_name: "MultiSensor_QPE_48H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 72 hr (Pass 1)", s3_name: "MultiSensor_QPE_72H_Pass1_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 1 hr (Pass 2)", s3_name: "MultiSensor_QPE_01H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 3 hr (Pass 2)", s3_name: "MultiSensor_QPE_03H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 6 hr (Pass 2)", s3_name: "MultiSensor_QPE_06H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 12 hr (Pass 2)", s3_name: "MultiSensor_QPE_12H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 24 hr (Pass 2)", s3_name: "MultiSensor_QPE_24H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 48 hr (Pass 2)", s3_name: "MultiSensor_QPE_48H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Multi-Sensor 72 hr (Pass 2)", s3_name: "MultiSensor_QPE_72H_Pass2_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                ]
            },
            {
                name: "Q3 Radar Only",
                type: "subcategory",
                items: [
                    { display_name: "Q3 Radar Only 15 min", s3_name: "RadarOnly_QPE_15M_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 1 hr", s3_name: "RadarOnly_QPE_01H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 3 hr", s3_name: "RadarOnly_QPE_03H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 6 hr", s3_name: "RadarOnly_QPE_06H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 12 hr", s3_name: "RadarOnly_QPE_12H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 24 hr", s3_name: "RadarOnly_QPE_24H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 48 hr", s3_name: "RadarOnly_QPE_48H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
                    { display_name: "Q3 Radar Only 72 hr", s3_name: "RadarOnly_QPE_72H_00.00", thresholds: millimetersThresholds, defaultColors: millimetersDefaultColors },
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
                    { display_name: "Base Reflectivity", s3_name: "MergedBaseReflectivity_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                    { display_name: "Base Reflectivity (Quality Control)", s3_name: "MergedBaseReflectivityQC_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                ]
            },
            {
                name: "Layer Reflectivity",
                type: "subcategory",
                items: [
                    { display_name: "Layer Reflectivity ANC", s3_name: "LayerCompositeReflectivity_ANC_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                    { display_name: "Layer Reflectivity Low (0 - 24,000 ft)", s3_name: "LayerCompositeReflectivity_Low_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                    { display_name: "Layer Reflectivity High (24,000 - 60,000 ft)", s3_name: "LayerCompositeReflectivity_High_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                    { display_name: "Layer Reflectivity Super (33,000 - 60,000 ft)", s3_name: "LayerCompositeReflectivity_Super_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                ]
            },
            {
                name: "Lowest Altitude Reflectivity",
                type: "subcategory",
                items: [
                    { display_name: "Reflectivity at Lowest Altitude", s3_name: "ReflectivityAtLowestAltitude_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                    { display_name: "Merged Reflectivity At Lowest Altitude", s3_name: "MergedReflectivityAtLowestAltitude_00.50", thresholds: decibelThresholds, defaultColors: decibelColors },
                ]
            }
        ]
    },
    {
        name: "Echo Top",
        type: "category",
        items: [
            { display_name: "Echo Top 18 dBZ", s3_name: "EchoTop_18_00.50", thresholds: echoTopThresholds, defaultColors: echoTopColors },
            { display_name: "Echo Top 30 dBZ", s3_name: "EchoTop_30_00.50", thresholds: echoTopThresholds, defaultColors: echoTopColors },
            { display_name: "Echo Top 50 dBZ", s3_name: "EchoTop_50_00.50", thresholds: echoTopThresholds, defaultColors: echoTopColors },
            { display_name: "Echo Top 60 dBZ", s3_name: "EchoTop_60_00.50", thresholds: echoTopThresholds, defaultColors: echoTopColors },
        ]
    },
    {
        name: "Radar Accumulation Quality Index",
        type: "category",
        items: [
            { display_name: "QPE RQI 1 hr", s3_name: "RadarAccumulationQualityIndex_01H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 3 hr", s3_name: "RadarAccumulationQualityIndex_03H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 6 hr", s3_name: "RadarAccumulationQualityIndex_06H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 12 hr", s3_name: "RadarAccumulationQualityIndex_12H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 24 hr", s3_name: "RadarAccumulationQualityIndex_24H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 48 hr", s3_name: "RadarAccumulationQualityIndex_48H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
            { display_name: "QPE RQI 72 hr", s3_name: "RadarAccumulationQualityIndex_72H_00.00", thresholds: qualityIndexThresholds, defaultColors: qualityIndexColors },
        ]
    },
    {
        name: "Gauge Influence Index",
        type: "category",
        items: [
            { display_name: "Gauge Influence Index 1 hr (Pass 1)", s3_name: "GaugeInflIndex_01H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 3 hr (Pass 1)", s3_name: "GaugeInflIndex_03H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 6 hr (Pass 1)", s3_name: "GaugeInflIndex_06H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 12 hr (Pass 1)", s3_name: "GaugeInflIndex_12H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 48 hr (Pass 1)", s3_name: "GaugeInflIndex_48H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 72 hr (Pass 1)", s3_name: "GaugeInflIndex_72H_Pass1_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 1 hr (Pass 2)", s3_name: "GaugeInflIndex_01H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 3 hr (Pass 2)", s3_name: "GaugeInflIndex_03H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 6 hr (Pass 2)", s3_name: "GaugeInflIndex_06H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 12 hr (Pass 2)", s3_name: "GaugeInflIndex_12H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 48 hr (Pass 2)", s3_name: "GaugeInflIndex_48H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
            { display_name: "Gauge Influence Index 72 hr (Pass 2)", s3_name: "GaugeInflIndex_72H_Pass2_00.00", thresholds: gaugeInfluenceIndexThresholds, defaultColors: gaugeInfluenceIndexColors },
        ]
    },
    {
        name: "Models",
        type: "category",
        items: [
            { display_name: "Model Freezing Height", s3_name: "Model_0degC_Height_00.50", thresholds: freezingHeightMetersThresholds, defaultColors: freezingHeightMetersColors },
            { display_name: "Warm Rain Probability", s3_name: "WarmRainProbability_00.50", thresholds: warmRainProbabilityPercentageThresholds, defaultColors: warmRainProbabilityPercentageColors },
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