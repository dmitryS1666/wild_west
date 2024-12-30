let failSound = new Audio('res/audio/fail.mp3');
let winSound = new Audio('res/audio/win.mp3');
let rouletteSound = new Audio('res/audio/wheel_spin.mp3');
let clickSound = new Audio('res/audio/click.mp3');
let tapSound = new Audio('res/audio/tap.mp3');
let shootSound = new Audio('res/audio/shoot.mp3');
let selectSound = new Audio('res/audio/select.mp3');
let hitSound = new Audio('res/audio/hit.mp3');
let slotSound = new Audio('res/audio/slot_sound.mp3');

let menuMusic;
let settings;
// Загрузка настроек из LocalStorage
function loadSettings() {
    menuMusic = document.getElementById('menuMusic');
    localStorage.setItem('wildWestSettings', JSON.stringify({ music: true, vibration: true }));
    localStorage.setItem('score', 1000);

    const storedSettings = JSON.parse(localStorage.getItem('wildWestSettings'));
    if (storedSettings) {
        settings = storedSettings;
    }

    document.getElementById('toggle-music').checked = settings.music;
    document.getElementById('toggle-vibration').checked = settings.vibration;
}

function saveSettings() {
    localStorage.setItem('wildWestSettings', JSON.stringify(settings));
}

document.getElementById('toggle-music').addEventListener('change', (event) => {
    settings.music = event.target.checked;
    saveSettings();

    if (settings.music) {
        clickSound.play();
    }

    if (!settings.music) {
        stopMusic();
    } else {
        runMusic();
    }
});

document.getElementById('toggle-vibration').addEventListener('change', (event) => {
    settings.vibration = event.target.checked;
    saveSettings();

    if (settings.vibration) {
        vibrate(100);
    }
});

function stopMusic() {
    if (!menuMusic.paused && menuMusic.currentTime > 0) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
}

function runMusic() {
    menuMusic.volume = 0.3;

    if (settings.music && (menuMusic.paused || menuMusic.currentTime === 0)) {
        menuMusic.play();
    }
}

function vibrate(duration) {
    if (settings.vibration) {
        navigator.vibrate(duration);
    }
}

function clickEffect() {
    if (settings.music) {
        clickSound.play();
    }

    if (settings.vibration) {
        vibrate(100);
    }
}

function tapEffect() {
    if (settings.music) {
        tapSound.play();
    }
}

function selectEffect() {
    if (settings.music) {
        selectSound.play();
    }
}

function hitEffect() {
    if (settings.music) {
        hitSound.currentTime = 0; // Обнуляем звук, чтобы он проигрывался с начала
        hitSound.play();
    }
}

function shootEffect() {
    if (settings.music) {
        shootSound.currentTime = 0; // Обнуляем звук, чтобы он проигрывался с начала
        shootSound.play();
    }
}

function rouletteEffect() {
    if (settings.music) {
        rouletteSound.play();
    }
}

function slotEffect() {
    if (settings.music) {
        slotSound.play();
    }
}

export {
    slotEffect,
    rouletteEffect,
    hitEffect,
    shootEffect,
    selectEffect,
    tapEffect,
    clickEffect,
    settings,
    loadSettings,
    saveSettings,
    failSound,
    winSound,
    stopMusic,
    runMusic
};
