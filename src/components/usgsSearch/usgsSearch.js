import './usgsSearch.css';

let markersCollection = null;
let toggleElement = null;
let searchInput = null;
let clearButton = null;
let dropdown = null;
let debounceTimer = null;

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;
const MAX_RESULTS = 10;

document.addEventListener('usgs-markers-ready', (event) => {
    markersCollection = event.detail.markers;
    toggleElement = event.detail.toggle;

    initializeSearchComponent();
});

function initializeSearchComponent() {
    searchInput = document.getElementById('usgs-search-input');
    clearButton = document.getElementById('usgs-search-clear');
    dropdown = document.getElementById('usgs-search-dropdown');

    if (!searchInput || !clearButton || !dropdown) {
        console.error('USGS Search: Required DOM elements not found');
        return;
    }

    searchInput.addEventListener('input', handleSearchInput);
    clearButton.addEventListener('click', handleClear);

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#usgs-search-container')) {
            hideDropdown();
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value;

    // Show/hide clear button
    clearButton.style.display = query.length > 0 ? 'block' : 'none';

    // Clear existing debounce timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    // Hide dropdown if query is too short
    if (query.length < MIN_SEARCH_LENGTH) {
        hideDropdown();
        return;
    }

    // Debounce the search
    debounceTimer = setTimeout(() => {
        performSearch(query);
    }, DEBOUNCE_DELAY);
}

function performSearch(query) {
    if (!markersCollection || !markersCollection.markers) {
        return;
    }

    const queryLower = query.toLowerCase();
    const results = [];

    // Search through all markers
    for (const markerObj of markersCollection.markers) {
        const id = markerObj.properties.id || '';
        const name = markerObj.properties.name || '';

        // Match by ID or name
        if (id.toLowerCase().includes(queryLower) ||
            name.toLowerCase().includes(queryLower)) {
            results.push(markerObj);

            // Stop at max results
            if (results.length >= MAX_RESULTS) {
                break;
            }
        }
    }

    displayResults(results);
}

function displayResults(results) {
    // Hide dropdown if no results
    if (results.length === 0) {
        hideDropdown();
        return;
    }

    // Clear existing dropdown content
    dropdown.innerHTML = '';

    // Create result items
    results.forEach(markerObj => {
        const item = document.createElement('div');
        item.className = 'usgs-search-result-item';

        const id = markerObj.properties.id || '';
        const name = markerObj.properties.name || '';

        // Display both ID and name
        item.innerHTML = `
            <div class="result-id">${id}</div>
            <div class="result-name">${name}</div>
        `;

        item.addEventListener('click', () => handleResultClick(markerObj));

        dropdown.appendChild(item);
    });

    // Show dropdown
    dropdown.style.display = 'block';
}

function hideDropdown() {
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

function handleResultClick(markerObj) {
    // 1. Make layer visible if it's not already
    if (toggleElement && !toggleElement.checked) {
        toggleElement.checked = true;
        toggleElement.dispatchEvent(new Event('change'));
    }

    // 2. Pan to the marker location
    const position = markerObj.marker.getPosition();
    if (map && position) {
        map.panTo(position);
    }

    // 3. Simulate marker click to toggle basin boundary
    google.maps.event.trigger(markerObj.marker, 'click');

    // Close dropdown and clear search
    hideDropdown();
    searchInput.value = '';
    clearButton.style.display = 'none';
}

function handleClear() {
    searchInput.value = '';
    clearButton.style.display = 'none';
    hideDropdown();
    searchInput.focus();
}
