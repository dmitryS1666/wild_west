// Переменные для игры
import {switchScreen} from "./ui";

let gameInterval;
let lives = 3;
let score = localStorage.getItem('score') || 0;
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
    let tapText = document.getElementById('startOldSaloonGame');
    tapText.style.display = 'none';

    if (isGameRunning) return; // Блокировка повторного нажатия
    isGameRunning = true;

    lives = 3;
    result = 0;
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
        fallingObject.addEventListener('click', () => {
            if (!isGameRunning) return;
            clearInterval(fallInterval);
            gameArea.removeChild(fallingObject);
            result += parseInt(object.weight);
            document.getElementById('scoreGameOS').innerText = `${result}`;
        });
    }, 1000);
}

// Функция для завершения игры
function endGame() {
    clearInterval(gameInterval);
    isGameRunning = false;
    const gameArea = document.getElementById('oldSaloonCanvas');
    gameArea.innerHTML = ''; // Удаляем все оставшиеся объекты
    localStorage.setItem('score', parseFloat(score) + result);

    setTimeout(() => {
        if (result !== 0) {
            switchScreen('winPage', result)
        } else  {
            switchScreen('failPage')
        }

        let tapText = document.getElementById('startOldSaloonGame');
        tapText.style.display = 'block';
    }, 1000);
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