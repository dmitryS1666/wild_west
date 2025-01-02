// --------------------------------------------- //
// ------------------ Рулетка ------------------ //
// --------------------------------------------- //

import {isCurrentScreen, switchScreen} from "./ui";
import {rouletteEffect} from "./settings";

const rouletteSegments = [3.2, 3.2, 1.2, 2.2, 3.2, 2.2, 0, 5.0];
let rouletteCanvas, rouletteCtx;
let isSpinning = false; // Флаг для отслеживания вращения рулетки
let score;
let gameOverRoulette = false; // Флаг для отслеживания состояния игры

const rouletteImage = new Image();
rouletteImage.src = 'res/wild_west/roulette-img.png'; // Заглушка: путь к изображению рулетки

const roulettePointerImage = new Image();
roulettePointerImage.src = 'res/wild_west/pointer.png'; // Заглушка: путь к изображению указателя

export function setupRoulette() {
    rouletteCanvas = document.getElementById('rouletteCanvas');
    rouletteCtx = rouletteCanvas.getContext('2d');

    drawRoulette(); // Отрисовываем рулетку

    // Отрисовываем стрелку поверх рулетки, чтобы она оставалась зафиксированной
    drawPointer();

    document.getElementById('spinButton').addEventListener('click', spinRoulette);

    // Устанавливаем начальные значения заглушек
    document.getElementById('currentBetRoulette').textContent = 10; // Заглушка ставки
    score = localStorage.getItem('score') || 0;
    // document.getElementById('scoreValue').textContent = score;
}

// Величина поворота в радианах
const rotationAngle = 22.5 * (Math.PI / 180);

// Функция для отрисовки рулетки
function drawRoulette() {
    const radius = rouletteCanvas.width / 2;
    const angle = 2 * Math.PI / rouletteSegments.length;

    // Очищаем и центрируем канвас
    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.save();
    rouletteCtx.translate(radius, radius);

    // Вращаем изображение рулетки
    rouletteCtx.rotate(rotationAngle);
    rouletteCtx.drawImage(rouletteImage, -radius, -radius, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.rotate(-rotationAngle); // Вращаем обратно для рисования секторов

    rouletteCtx.restore();
}

// Функция для рисования фиксированной стрелки-указателя над рулеткой
function drawPointer() {
    const pointerX = rouletteCanvas.width / 2 - 32; // Центр рулетки по X
    const pointerY = 203; // Позиция стрелки сверху канваса
    // const pointerSize = 20; // Размер изображения стрелки

    rouletteCtx.drawImage(
        roulettePointerImage,
        pointerX,// - pointerSize / 2, // Центрируем изображение по оси X
        pointerY, // Стрелка у верхней части рулетки
        122, // Ширина стрелки
        78 // Высота стрелки
    );
}

// Функция для запуска вращения рулетки
function spinRoulette() {
    const spinButton = document.getElementById('spinButton'); // Получаем кнопку старта
    const plusButton = document.getElementById('plusBetRoulette'); // Получаем кнопку старта
    const minusButton = document.getElementById('minusBetRoulette'); // Получаем кнопку старта

    if (isSpinning) return; // Блокируем повторное вращение
    isSpinning = true;
    spinButton.disabled = true; // Блокируем кнопку старта
    plusButton.disabled = true; // Блокируем кнопку старта
    minusButton.disabled = true; // Блокируем кнопку старта
    gameOverRoulette = false;

    rouletteEffect();

    const spinDuration = 4000; // Время вращения в миллисекундах
    const segmentAngle = 360 / rouletteSegments.length; // Угол одного сектора

    // Выбираем случайный выигрышный сегмент
    const winningSegment = Math.floor(Math.random() * rouletteSegments.length);

    // Рассчитываем угол, на который нужно повернуть рулетку, чтобы выигрышный сектор оказался вверху
    const targetAngle = winningSegment * segmentAngle;

    // Для корректного отображения поворачиваем на 90 градусов влево
    const adjustedTargetAngle = (targetAngle - 90 + 22.5) % 360; // Добавляем 90 градусов и нормализуем угол

    // Рассчитываем полный угол вращения рулетки
    const totalSpinAngle = 360 * 3 + (360 - adjustedTargetAngle); // 3 полных оборота + до нужного сектора

    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const currentAngle = totalSpinAngle * progress;

        // Очищаем холст и рисуем рулетку с учётом вращения
        rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
        rouletteCtx.save();
        rouletteCtx.translate(rouletteCanvas.width / 2, rouletteCanvas.height / 2);
        rouletteCtx.rotate((currentAngle * Math.PI) / 180); // Вращаем рулетку
        rouletteCtx.translate(-rouletteCanvas.width / 2, -rouletteCanvas.height / 2);
        drawRoulette(); // Отрисовка рулетки
        rouletteCtx.restore();

        // Рисуем стрелку
        drawPointer();

        if (progress < 1) {
            requestAnimationFrame(animate); // Продолжаем анимацию
        } else {
            // После остановки обработка победного сектора
            isSpinning = false;
            if (!gameOverRoulette) {
                endGameRoulette(winningSegment, spinButton, minusButton, plusButton); // Передаём кнопку для разблокировки
            }
        }
    }

    requestAnimationFrame(animate); // Запуск анимации
}

// Функция завершения игры
function endGameRoulette(winningSegment, spinButton, minusBtn, plusBtn) {
    let currentBet = document.getElementById('currentBetRoulette').innerText; // Заглушка ставки
    let skipResult = false;
    let rate = rouletteSegments[winningSegment];

    let result = parseInt(parseFloat(rate) * parseFloat(currentBet));

    score = localStorage.getItem('score') || 0;
    document.getElementById('scoreValue').textContent = score;

    localStorage.setItem('score', parseFloat(score) + result);
    gameOverRoulette = true; // Игра завершена

    // Проверка, находится ли пользователь на игровом экране
    if (!isCurrentScreen('mostWantedPage')) {
        skipResult = true; // Принудительно пропускаем результат, если экран сменился
    }

    if (!skipResult) {
        setTimeout(() => {
            localStorage.setItem('lastGame', 'mostWantedPage');

            if (result !== 0) {
                switchScreen('winPage', result, 'url(../res/wild_west/most_wanted_bg.png) no-repeat');
            } else {
                switchScreen('failPage');
            }
            spinButton.disabled = false; // Разблокируем кнопку после показа результата
            minusBtn.disabled = false; // Разблокируем кнопку после показа результата
            plusBtn.disabled = false; // Разблокируем кнопку после показа результата
        }, 1000);
    } else {
        spinButton.disabled = false; // Разблокируем кнопку на случай смены экрана
        minusBtn.disabled = false; // Разблокируем кнопку на случай смены экрана
        plusBtn.disabled = false; // Разблокируем кнопку на случай смены экрана
    }
}

const minusBetRBtn = document.getElementById('minusBetRoulette');
if (minusBetRBtn) {
    minusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetRoulette');
        if (bet.innerText > 0 && bet.innerText !== '10') {
            bet.innerText = parseFloat(bet.innerText) - 10;
        }
    });
}

const plusBetRBtn = document.getElementById('plusBetRoulette');
if (plusBetRBtn) {
    plusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetRoulette');
        let currentBet = parseFloat(bet.innerText);

        if (currentBet + 10 <= score) {
            bet.innerText = currentBet + 10;
        }
    });
}
