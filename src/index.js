import {loadSettings, runMusic, stopMusic} from './settings.js';
import {checkQuestionOfTheDay} from './game.js';
import {showPreloader, switchScreen} from "./ui";

import {App} from "@capacitor/app";

window.displayGame = displayGame;
window.displayLockedGame = displayLockedGame;
window.displayDefaultGames = displayDefaultGames;

document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('firstRun', 'true');
    lockPortraitOrientation();

    // if (window.NetworkStatusController.isConnectedToInternet()) {
    //     loadBanner();
    // } else {
        switchScreen('firstPage');
    // }
});

function loadBanner() {
    if (window.BannerLoader && typeof window.BannerLoader.loadBanner === "function") {
        window.BannerLoader.loadBanner()
    }
    setTimeout(() => {
        showPreloader();
    }, 2600);
}

// Отображение игры
export async function displayGame(title, bgUrl, fgUrl, playButton) {
    if (title !== 'Main game') {
        const gameElement = document.createElement('div');
        gameElement.className = 'game';
        gameElement.style.backgroundImage = `url(${bgUrl})`;

        const logo = document.createElement('img');
        logo.src = fgUrl;
        gameElement.appendChild(logo);

        // Добавляем кнопку игры
        const button = document.createElement('button');
        button.innerHTML = playButton;

        // Если `title` является ссылкой, то по нажатию на кнопку откроется эта ссылка через Browser API
        if (typeof title === 'string' && (title.startsWith('http://') || title.startsWith('https://'))) {
            button.addEventListener('click', async () => {
                try {
                    const openInExternalBrowser = async () => {
                        window.open(title, '_system'); // открывает внешний браузер
                    };

                    openInExternalBrowser();
                } catch (e) {
                    console.error('Error opening browser:', e);
                }
            });
        } else {
            button.addEventListener('click', () => {
                document.getElementById('gamesList').classList.add("hidden");
                switchScreen('firstPage');
            });
        }

        gameElement.appendChild(button);

        // Добавляем элемент игры в список игр
        document.getElementById('gamesList').appendChild(gameElement);
    } else {
        switchScreen('firstPage');
    }
}

// Отображение заблокированной игры
function displayLockedGame(title, bgUrl, fgUrl, playButton) {
    let gameElement = document.createElement('div');
    gameElement.className = 'game locked';
    gameElement.style.backgroundImage = 'url(' + bgUrl + ')';

    let logo = document.createElement('img');
    logo.src = fgUrl;
    gameElement.appendChild(logo);

    let lockIcon = document.createElement('span');
    lockIcon.className = 'lock-icon';  // Значок замка
    gameElement.appendChild(lockIcon);

    document.getElementById('gamesList').appendChild(gameElement);
}

// Отображение предустановленных игр в случае ошибки
function displayDefaultGames() {
    switchScreen('firstPage');
}

export function checkFirstRunAndLoadData() {
    let acceptPrivacy = localStorage.getItem('acceptPolicy');

    if (acceptPrivacy) {
        loadSettings();
        checkQuestionOfTheDay();
    } else {
        switchScreen('acceptPage');
    }
}

function lockPortraitOrientation() {
    if (window.ScreenOrientationController && typeof window.ScreenOrientationController.lockOrientation === "function") {
        window.ScreenOrientationController.lockOrientation('portrait');
    }
}

App.addListener('backButton', ({canGoBack}) => {
    stopMusic(); // Явно останавливаем музыку перед минимизацией приложения
    App.minimizeApp();
});

// Слушатель для восстановления/сворачивания приложения, включая кнопку "Домой"
App.addListener('appStateChange', ({isActive}) => {
    if (isActive) {
        runMusic(); // Включаем музыку при возвращении в активное состояние
    } else {
        stopMusic();  // Останавливаем музыку при сворачивании
    }
});
