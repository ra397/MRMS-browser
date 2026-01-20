// Unit conversion system
// Easily extensible: add new unit pairs by adding entries to unitConversions

const unitConversions = {
    // [metricUnit]: { imperialUnit, toImperial: (value) => convertedValue, toMetric: (value) => convertedValue }
    'mm': {
        imperialUnit: 'in',
        toImperial: (v) => v / 25.4,
        toMetric: (v) => v * 25.4,
    },
    'km': {
        imperialUnit: 'mi',
        toImperial: (v) => v / 1.60934,
        toMetric: (v) => v * 1.60934,
    },
    'm': {
        imperialUnit: 'ft',
        toImperial: (v) => v * 3.28084,
        toMetric: (v) => v / 3.28084,
    },
};

// Current unit system: 'metric' or 'imperial'
let currentSystem = 'metric';

export const unitSystem = {
    get() {
        return currentSystem;
    },

    set(system) {
        if (system !== 'metric' && system !== 'imperial') {
            console.warn(`Invalid unit system: ${system}`);
            return;
        }
        currentSystem = system;
        document.dispatchEvent(new CustomEvent('unit-system-changed', { detail: { system } }));
    },

    isMetric() {
        return currentSystem === 'metric';
    },

    isImperial() {
        return currentSystem === 'imperial';
    },

    // Check if a unit has a conversion available
    hasConversion(metricUnit) {
        return metricUnit in unitConversions;
    },

    // Get the display unit based on current system
    getDisplayUnit(metricUnit) {
        if (currentSystem === 'metric' || !unitConversions[metricUnit]) {
            return metricUnit;
        }
        return unitConversions[metricUnit].imperialUnit;
    },

    // Convert a value from metric to the current display system
    convertValue(value, metricUnit) {
        if (value === null || value === undefined) {
            return null;
        }
        if (currentSystem === 'metric' || !unitConversions[metricUnit]) {
            return value;
        }
        return unitConversions[metricUnit].toImperial(value);
    },

    // Convert an array of thresholds from metric to the current display system
    convertThresholds(thresholds, metricUnit) {
        if (currentSystem === 'metric' || !unitConversions[metricUnit]) {
            return thresholds;
        }
        const converter = unitConversions[metricUnit].toImperial;
        return thresholds.map(v => converter(v));
    },
};
