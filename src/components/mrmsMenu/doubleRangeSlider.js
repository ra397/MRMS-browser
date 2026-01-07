// Makes sure the knobs don't overlap
// Updates label

const minInput = document.getElementById('mrms-min');
const maxInput = document.getElementById('mrms-max');
const rangeLabel = document.getElementById('mrms-range-value-label');
const track = document.querySelector('.slider-track');

const minGap = 0;

function handleMinInput() {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (minVal > maxVal - minGap) {
        minInput.value = maxVal - minGap;
    }
    updateVisuals();
}

function handleMaxInput() {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (maxVal < minVal + minGap) {
        maxInput.value = minVal + minGap;
    }
    updateVisuals();
}

function updateVisuals() {
    const minVal = parseInt(minInput.value);
    const maxVal = parseInt(maxInput.value);

    rangeLabel.textContent = `${minVal} - ${maxVal}`;

    // Calculate percentages for the track fill
    const percent1 = (minVal / minInput.max) * 100;
    const percent2 = (maxVal / maxInput.max) * 100;

    track.style.background = `linear-gradient(to right, 
        #e2e8f0 ${percent1}%, 
        #e2e8f0 ${percent1}%, 
        #e2e8f0 ${percent2}%, 
        #e2e8f0 ${percent2}%)`;
}

minInput.addEventListener('input', handleMinInput);
maxInput.addEventListener('input', handleMaxInput);

// Initialize visuals on load
updateVisuals();