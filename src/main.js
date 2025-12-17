import './components/map/map.js';

import './api/api.js';
import './display/display.js';

import './components/productSelector/productSelector.js';

import './components/timeline/timeline.js';

import './components/player/player.js';

import './components/sidebar/sidebar.js';

import './components/datatable/datatable.js';

import './components/settings/settings.js';

import './style.css';

// Storage usage for origin - Includes IndexedDB usage
// if (navigator.storage && navigator.storage.estimate) {
//     const { usage, quota } = await navigator.storage.estimate();
//     console.log(`Used: ${usage} bytes`);
//     console.log(`Quota: ${quota} bytes`);
//     console.log(`Percent used: ${(usage / quota * 100).toFixed(2)}%`);
// }