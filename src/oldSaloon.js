// Переменные для игры
import {isCurrentScreen, switchScreen} from "./ui";
import {tapEffect, shootEffect, hitEffect} from "./settings";

let gameInterval;
let lives = 3;
let score;
let result = 0;
let isGameRunning = false;

const objects = [
    { name: 'HEAD', weight: 50, speed: 2, icon: 'res/wild_west/oldSaloon/head.png' },
    { name: 'HAT', weight: 50, speed: 2, icon: 'res/wild_west/oldSaloon/hat.png' },
    { name: 'MONEY', weight: 100, speed: 3, icon: 'res/wild_west/oldSaloon/money.png' },
    { name: 'GUN', weight: 10, speed: 1, icon: 'res/wild_west/oldSaloon/gun.png' },
    { name: 'BOTTLE', weight: 50, speed: 2, icon: 'res/wild_west/oldSaloon/bottle.png' },
    { name: 'BANK', weight: 100, speed: 3, icon: 'res/wild_west/oldSaloon/bank.png' },
];

// Функция для запуска игры
export function startGame() {
    tapEffect();

    let tapText = document.getElementById('startOldSaloonGame');
    tapText.style.display = 'none';

    if (isGameRunning) return; // Блокировка повторного нажатия
    isGameRunning = true;

    lives = 3;
    result = 0;
    score = localStorage.getItem('score') || 0;
    document.getElementById('scoreGameOS').innerText = `${result}`;

    const gameArea = document.getElementById('oldSaloonCanvas');
    gameArea.innerHTML = '';

    gameInterval = setInterval(() => {
        if (lives <= 0) {
            endGame();
            return;
        }

        // Создание нового падающего объекта
        const object = objects[Math.floor(Math.random() * objects.length)];
        const fallingObject = document.createElement('img');
        fallingObject.className = 'fallingObject';
        fallingObject.src = object.icon;
        fallingObject.dataset.weight = object.weight;
        fallingObject.style.left = `${Math.random() * 90}%`;
        fallingObject.style.position = 'absolute';
        fallingObject.style.top = '0';

        // Добавляем объект в игровую область
        gameArea.appendChild(fallingObject);

        // Анимация падения объекта
        let position = 0;
        const fallInterval = setInterval(() => {
            if (!isGameRunning) {
                clearInterval(fallInterval);
                return;
            }

            if (position >= 100) { // Если объект достиг нижней границы
                clearInterval(fallInterval);
                gameArea.removeChild(fallingObject);
                loseLife();
            } else {
                position += object.speed;
                fallingObject.style.top = `${position}%`;
            }
        }, 50);

        // Обработка ловли объекта
        fallingObject.addEventListener('click', (event) => {
            if (!isGameRunning) return;
            clearInterval(fallInterval);
            gameArea.removeChild(fallingObject);
            result += parseInt(object.weight);

            // Проигрываем звуковой эффект попадания
            hitEffect();

            document.getElementById('scoreGameOS').innerText = `${result}`;
        });
    }, 1000);
}

// Функция для завершения игры
function endGame() {
    let skipResult = false;
    clearInterval(gameInterval);
    isGameRunning = false;

    const gameArea = document.getElementById('oldSaloonCanvas');
    gameArea.innerHTML = ''; // Удаляем все объекты

    // Проверка, находится ли пользователь на игровом экране
    if (!isCurrentScreen('oldSaloonPage')) {
        skipResult = true; // Принудительно пропускаем результат, если экран сменился
    }

    // Проверяем, нужно ли показывать результат и обновлять счёт
    if (!skipResult) {
        localStorage.setItem('score', parseFloat(score) + result);
        localStorage.setItem('lastGame', 'oldSaloonPage');

        if (result !== 0) {
            switchScreen('winPage', result, 'url(../res/wild_west/old_saloon_bg.png) no-repeat');
        } else {
            switchScreen('failPage');
        }
    }

    let tapText = document.getElementById('startOldSaloonGame');
    tapText.style.display = 'block';
}

// Функция для потери жизни
function loseLife() {
    lives--;
    updateLifeIcons();
    if (lives <= 0) {
        endGame();
    }
}

// Функция для обновления иконок жизней
function updateLifeIcons() {
    const extraPointDiv = document.getElementById('extraPoint');
    extraPointDiv.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const lifeIcon = document.createElement('img');
        lifeIcon.src = i < (3 - lives) ? 'res/wild_west/dead_life.png' : 'res/wild_west/active_life.png';
        extraPointDiv.appendChild(lifeIcon);
    }
}

// Слушатель для кнопки старта
// document.getElementById('startOldSaloonGame').addEventListener('click', startGame);
