import './components/map/map.js';
import './components/map/map.css';

import './components/menu/MenuComponent.js';

import './style.css';

import './api/api.js';
import './decode/decode.js';
import './display/display.js';

document.getElementById('app').innerHTML = `
    <div id="map"></div>
    <menu-component></menu-component>
`;