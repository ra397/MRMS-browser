import './player.css';

let isPlaying = false;

const playPause = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("step-backward");
const nextBtn = document.getElementById("step-forward");

const playSVG = `
    <svg height="100%" width="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,0 0,100 75,50 0,0" fill="black"/>
    </svg>
`;

const pauseSVG = `
    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="10" width="20" height="80" fill="black"/>
        <rect x="60" y="10" width="20" height="80" fill="black" />
    </svg>
`;

playPause.addEventListener("click", () => {
    togglePlayPause();
});

nextBtn.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("player-step", {
        detail: { direction: 1 },
    }));
});

prevBtn.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("player-step", {
        detail: { direction: -1 },
    }));
});

function togglePlayPause() {
    isPlaying = !isPlaying; // update state
    playPause.innerHTML = isPlaying ? pauseSVG : playSVG; // update icon
    const eventName = isPlaying ? 'player-play' : 'player-pause';
    document.dispatchEvent(new CustomEvent(eventName));
}

playPause.innerHTML = playSVG;

/* Player Seek Slider */

const slider = document.getElementById('player-seek');


slider.addEventListener('input', () => {
   const index = parseInt(slider.value, 10);
   document.dispatchEvent(new CustomEvent("player-seek", {
       detail: { index },
   }));
});

export function setSliderRange(min, max) {
    slider.min = min;
    slider.max = max;
    slider.value = min;
}

export function setSliderValue(value) {
    slider.value = value;
}

function getSliderValue() {
    return parseInt(slider.value, 10);
}