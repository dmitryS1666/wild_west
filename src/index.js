import {loadSettings, runMusic, stopMusic} from './settings.js';
import {showPreloader, switchScreen} from "./ui";

import {App} from "@capacitor/app";

let screenHistory = []; // Массив для хранения истории экранов

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


    const musicToggle = document.getElementById('toggle-music'); // Чекбокс для музыки
    const menuMusic = document.getElementById('menuMusic'); // Элемент аудио

    // Загрузка состояния музыки из localStorage (по умолчанию включена)
    const isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false'; // Если null, считаем, что включена
    musicToggle.checked = isMusicEnabled; // Синхронизация переключателя с состоянием

    // Функция обновления состояния музыки
    function updateMusicState(enabled) {
        if (enabled) {
            menuMusic.volume = 0.3;
            menuMusic.play(); // Воспроизвести музыку
        } else {
            menuMusic.pause(); // Остановить музыку
        }
        localStorage.setItem('musicEnabled', enabled); // Сохранить состояние
    }

    // Инициализация воспроизведения
    updateMusicState(isMusicEnabled);

    // Обработчик изменения чекбокса
    musicToggle.addEventListener('change', (event) => {
        updateMusicState(event.target.checked);
    });
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

// Обработчик кнопки "Назад"
App.addListener('backButton', ({ canGoBack }) => {
    stopMusic(); // Останавливаем музыку

    if (screenHistory.length > 1) {
        screenHistory.pop(); // Убираем текущий экран из стека
        const previousScreen = screenHistory[screenHistory.length - 1]; // Предыдущий экран
        switchScreen(previousScreen); // Переход на предыдущий экран
    } else {
        App.minimizeApp(); // Если больше нельзя вернуться назад, минимизируем приложение
    }
});

// Пример вызова switchScreen для переходов
document.getElementById('settingsButton').addEventListener('click', () => {
    switchScreen('settings');
});
document.getElementById('back').addEventListener('click', () => {
    switchScreen('menuPage');
});





// Слушатель для восстановления/сворачивания приложения, включая кнопку "Домой"
App.addListener('appStateChange', ({isActive}) => {
    if (isActive) {
        runMusic(); // Включаем музыку при возвращении в активное состояние
    } else {
        stopMusic();  // Останавливаем музыку при сворачивании
    }
});
