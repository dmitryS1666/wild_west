import {
    showInfoBlock,
    timer,
} from './game.js';

import {
    failSound,
    runMusic,
    stopMusic,
    winSound,
    clickSound,
    vibrate
} from './settings'

import {checkFirstRunAndLoadData} from "./index";
import { Plugins } from '@capacitor/core';
import {setupRoulette} from "./mostWanted";
import {setupSpinJack} from "./spinJack";
import {startGame} from "./oldSaloon";

const { App } = Plugins;

// читать политику
const readPrivacyPolicyBtn = document.getElementById('readPrivacyPolicy');
if (readPrivacyPolicyBtn) {
    readPrivacyPolicyBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);

        const openInExternalBrowser = async () => {
            window.open('https://appwildwest.com/policy', '_system'); // открывает внешний браузер
        };

        openInExternalBrowser();
    });
}

// читать политику
const privacyBtn = document.getElementById('privacyBtn');
if (privacyBtn) {
    privacyBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);

        const openInExternalBrowser = async () => {
            window.open('https://appwildwest.com/policy', '_system'); // открывает внешний браузер
        };

        openInExternalBrowser();
    });
}

// читать политику
const privacyPolicyBtn = document.getElementById('privacyPolicy');
if (privacyPolicyBtn) {
    privacyPolicyBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);

        const openInExternalBrowser = async () => {
            window.open('https://appwildwest.com/policy', '_system'); // открывает внешний браузер
        };

        openInExternalBrowser();
    });
}

// BACK
const backBtn = document.getElementById('back');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        switchScreen('firstPage');
    });
}

// Open GAMES PAGE
const gamesBtn = document.getElementById('gamesBtn');
if (gamesBtn) {
    gamesBtn.addEventListener('click', () => {
        switchScreen('gamesPage');
    });
}

// подтвердить политику
const acceptPrivacyBtn = document.getElementById('acceptPrivacy');
if (acceptPrivacyBtn) {
    acceptPrivacyBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);
        localStorage.setItem('acceptPolicy', true);
    });
}

// play game
const playBtn = document.getElementById('playBtn');
if (playBtn) {
    playBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);
        checkFirstRunAndLoadData();
    });
}

// reset game
const resetGameBtn = document.getElementById('resetGame');
if (resetGameBtn) {
    resetGameBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);

        localStorage.clear();
        localStorage.setItem('extraPoints', 6);

        // Показать уведомление
        const resetNotification = document.getElementById('resetNotification');
        resetNotification.classList.remove('hidden');

        setTimeout(() => {
            resetNotification.classList.add('hidden');
        }, 1500);
    });
}
const okSettingsBtn = document.getElementById('okSettings');
if (okSettingsBtn) {
    okSettingsBtn.addEventListener('click', () => {
        switchScreen('firstPage');
    });
}

const toggleMusicBtn = document.getElementById('toggle-music');
if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);
    });
}

const toggleVibrationBtn = document.getElementById('toggle-vibration');
if (toggleVibrationBtn) {
    toggleVibrationBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);
    });
}

// reset game
const continueFailBtn = document.getElementById('continueFail');
if (continueFailBtn) {
    continueFailBtn.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);
    });
}

// BACK button - close_btn
const closeBtn = document.getElementById('close_btn');
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        switchScreen('menuPage');
    });
}

//
const firstPageTap = document.getElementById('firstPage');
if (firstPageTap) {
    firstPageTap.addEventListener("click", () => {
        switchScreen('menuPage');
    });
}

// BACK_WIN or FAIL_WIN
const backWinBtn = document.getElementById('backWin');
if (backWinBtn) {
    backWinBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

// AGAIN_WIN or AGAIN_WIN
const againWinBtn = document.getElementById('againWin');
if (againWinBtn) {
    againWinBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

// BACK_WIN or FAIL_WIN
const backFailBtn = document.getElementById('backFail');
if (backFailBtn) {
    backFailBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

// AGAIN_WIN or AGAIN_WIN
const againFailBtn = document.getElementById('againFail');
if (againFailBtn) {
    againFailBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

// BACK_ROULETTE
const backRouletteBtn = document.getElementById('backRoulette');
if (backRouletteBtn) {
    backRouletteBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

// BACK_OLD_SALOON
const backOldSaloonBtn = document.getElementById('backOldSaloon');
if (backOldSaloonBtn) {
    backOldSaloonBtn.addEventListener("click", () => {
        switchScreen('gamesPage');
    });
}

const settingsButton = document.getElementById('settingsButton');
if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        clickSound.play();
        vibrate(100);

        clearInterval(timer); // Очищаем таймер при выборе ответа
        switchScreen('settings'); // Переход к экрану основных вопросов
    });
}

const startOldSaloonBtn = document.getElementById('startOldSaloonGame');
if (startOldSaloonBtn) {
    clickSound.play();
    vibrate(100);

    startOldSaloonBtn.addEventListener('click', startGame);
}

const settingBtn = document.getElementById('settingBtn');
if (settingBtn) {
    settingBtn.addEventListener('click', () => {
        clearInterval(timer); // Очищаем таймер при выборе ответа
        switchScreen('settings'); // Переход к экрану основных вопросов
    });
}

function showPreloader() {
    return new Promise((resolve) => {
        $(`#preloaderPage`).fadeIn(500);
        setTimeout(() => {
            let percentageElement = document.getElementById('percentage');
            percentageElement.textContent = '0%'; // Сбрасываем текст
            let progress = 0;
            updatePercentage(percentageElement, progress);
        // }, 500);
        }, 200);

        setTimeout(() => {
            $(`#preloaderPage`).fadeOut(500, resolve); // Вызов resolve после завершения fadeOut
        // }, 1000);
        }, 300);
    });
}

function switchScreen(screenId, levelScore= 0) {
    clickSound.play();
    vibrate(100);

    const screens = document.querySelectorAll('.screen');
    showInfoBlock(false);

    // Скрываем все экраны
    screens.forEach(screen => screen.classList.add('hidden'));

    // Показываем прелоадер
    showPreloader().then(() => {
        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.remove('hidden');

        if (screenId === 'winPage') {
            stopMusic();
            showWinPage(levelScore);
            showInfoBlock(false);
        }
        if (screenId === 'failPage') {
            stopMusic();
            failSound.play();
            showInfoBlock(false);
        }
        if (screenId === 'spinJackPage') {
            showInfoBlock(false);
            setupSpinJack();
        }
        if (screenId === 'mostWantedPage') {
            showInfoBlock(false);
            setupRoulette();
        }
        if (screenId === 'oldSaloonPage') {
            showInfoBlock(true);
        }

        document.getElementById('scoreValue').innerText = localStorage.getItem('score');
    });
}

function showWinPage(levelScore) {
    const valueElement = document.getElementById('winValue');
    winSound.play();

    valueElement.innerHTML = `+${levelScore}`;
    valueElement.classList.remove('hidden');

    runMusic();
}

const continueBtn = document.getElementById("continue");
if (continueBtn) {
    continueBtn.addEventListener("click", () => {
        const selectedCheckbox = document.querySelector('input[name="image-checkbox"]:checked');
        if (selectedCheckbox) {
            switchScreen(selectedCheckbox.value); // Переход к экрану игры
        }
    });
}

window.adjustImages = function(selectedCheckbox) {
    const allImages = document.querySelectorAll(".checkbox-item img");

    allImages.forEach(image => {
        image.style.transform = "scale(1)";
    });

    const selectedImage = selectedCheckbox.nextElementSibling;
    selectedImage.style.transform = "scale(1.1)";
}

function updatePercentage(percentageElement, progress) {
    if (progress <= 100) {
        percentageElement.textContent = `${progress}%`;
        setTimeout(() => updatePercentage(percentageElement, progress + 1), 50); // Увеличение каждые 50 мс
    }
}

export {switchScreen, showPreloader};
