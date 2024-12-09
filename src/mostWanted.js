// --------------------------------------------- //
// ------------------ Рулетка ------------------ //
// --------------------------------------------- //

import {clickSound, vibrate} from "./settings";
import {switchScreen} from "./ui";

const rouletteSegments = [3.2, 3.2, 1.2, 2.2, 3.2, 2.2, 0, 5.0];
let rouletteCanvas, rouletteCtx;
let isSpinning = false; // Флаг для отслеживания вращения рулетки
let score = localStorage.getItem('score') || 0;
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
    document.getElementById('scoreValue').textContent = score;
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
    if (isSpinning) return; // Блокируем повторное вращение
    isSpinning = true;
    gameOverRoulette = false;

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
                endGameRoulette(winningSegment); // Вывод результата
            }
        }
    }

    requestAnimationFrame(animate); // Запуск анимации
}

// Функция завершения игры
function endGameRoulette(winningSegment) {
    let currentBet = document.getElementById('currentBetRoulette').innerText; // Заглушка ставки
    let result;

    let rate = rouletteSegments[winningSegment];

    result = parseFloat(rate) * parseFloat(currentBet);

    console.log(`Выпавший сектор: ${rouletteSegments[winningSegment]}`);
    console.log(`Текущая ставка: ${currentBet}`);
    console.log(`Результат: ${result}`);

    localStorage.setItem('score', parseFloat(score) + result);
    gameOverRoulette = true; // Игра завершена


    setTimeout(() => {
        if (result !== 0) {
            switchScreen('winPage', 123)
        } else  {
            switchScreen('failPage')
        }
    }, 2500);
}

const minusBetRBtn = document.getElementById('minusBetRoulette');
if (minusBetRBtn) {
    minusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetRoulette');
        if (bet.innerText > 0) {
            bet.innerText = parseFloat(bet.innerText) - 10;
        }
    });
}

const plusBetRBtn = document.getElementById('plusBetRoulette');
if (plusBetRBtn) {
    plusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetRoulette');
        bet.innerText = parseFloat(bet.innerText) + 10;
    });
}