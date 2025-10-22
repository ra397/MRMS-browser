import './components/map/map.js'
import './components/map/map.css'

import './components/menu/MenuComponent.js'

import './style.css'

import { convertUTCtoLocal } from './utils/timeConverter.js'

document.getElementById('app').innerHTML = `
    <div id="map"></div>
    <menu-component></menu-component>
`;