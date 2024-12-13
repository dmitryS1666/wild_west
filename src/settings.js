let failSound = new Audio('res/audio/fail.mp3');
let winSound = new Audio('res/audio/win.mp3');
let timeOutSound = new Audio('res/audio/time_out.mp3');
let clickSound = new Audio('res/audio/click.mp3');

const menuMusic = document.getElementById('menuMusic');

let settings = {
    music: false,
    vibration: true,
};

// Загрузка настроек из LocalStorage
function loadSettings() {
    const storedSettings = JSON.parse(localStorage.getItem('quizSettings'));
    if (storedSettings) {
        settings = storedSettings;
    }

    document.getElementById('toggle-music').checked = settings.music;
    document.getElementById('toggle-vibration').checked = settings.vibration;
}

function saveSettings() {
    localStorage.setItem('quizSettings', JSON.stringify(settings));
}

document.getElementById('toggle-music').addEventListener('change', (event) => {
    settings.music = event.target.checked;
    saveSettings();

    if (!settings.music) {
        stopMusic();
    } else {
        runMusic();
    }
});

document.getElementById('toggle-vibration').addEventListener('change', (event) => {
    settings.vibration = event.target.checked;
    saveSettings();
});

function stopMusic() {
    if (!menuMusic.paused && menuMusic.currentTime > 0) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
}

function runMusic() {
    menuMusic.volume = 0.6;

    if (settings.music && (menuMusic.paused || menuMusic.currentTime === 0)) {
        menuMusic.play();
    }
}

function vibrate(duration) {
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

export {
    vibrate,
    settings,
    loadSettings,
    saveSettings,
    failSound,
    winSound,
    timeOutSound,
    stopMusic,
    clickSound,
    runMusic
};
