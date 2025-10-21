import './components/Map/map.js'
import './components/Map/map.css'

import './components/Menu/MenuComponent.js'

import './style.css'

import { convertUTCtoLocal } from './utils/timeConverter.js'

document.getElementById('app').innerHTML = `
    <div id="map"></div>
    <menu-component></menu-component>
`;