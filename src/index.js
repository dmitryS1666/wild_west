import {loadSettings, runMusic, stopMusic} from './settings.js';
import {showPreloader, switchScreen} from "./ui";

import {App} from "@capacitor/app";

let screenHistory = []; // Массив для хранения истории экранов

window.displayDefaultGames = displayDefaultGames;

document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('firstRun', 'true');
    lockPortraitOrientation();
    loadSettings();

        // if (window.NetworkStatusController.isConnectedToInternet()) {
        //     loadBanner();
        // } else {
            showPreloader().then(() => {
                checkFirstRunAndLoadData();
            });
        // }
});

function loadBanner() {
    if (window.BannerLoader && typeof window.BannerLoader.loadBanner === "function") {
        window.BannerLoader.loadBanner()
    }
    setTimeout(() => {
        showPreloader();
    }, 3200);
}

// Отображение игры
export async function displayDefaultGames() {
    checkFirstRunAndLoadData();
}

export function checkFirstRunAndLoadData() {
    let acceptPrivacy = localStorage.getItem('acceptPolicy');

    if (acceptPrivacy) {
        switchScreen('menuPage');
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
// App.addListener('backButton', ({ canGoBack }) => {
//     stopMusic(); // Останавливаем музыку
//
//     if (screenHistory.length > 1) {
//         screenHistory.pop(); // Убираем текущий экран из стека
//         const previousScreen = screenHistory[screenHistory.length - 1]; // Предыдущий экран
//         switchScreen(previousScreen); // Переход на предыдущий экран
//     } else {
//         App.minimizeApp(); // Если больше нельзя вернуться назад, минимизируем приложение
//     }
// });

// Слушатель для восстановления/сворачивания приложения, включая кнопку "Домой"
App.addListener('appStateChange', ({isActive}) => {
    if (isActive) {
        runMusic(); // Включаем музыку при возвращении в активное состояние
    } else {
        stopMusic();  // Останавливаем музыку при сворачивании
    }
});
