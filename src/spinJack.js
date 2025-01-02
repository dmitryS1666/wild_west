import {isCurrentScreen, switchScreen} from "./ui";
import {slotEffect} from "./settings";

const symbols = [
    'res/wild_west/spinJack/bank.png',
    'res/wild_west/spinJack/bottle.png',
    'res/wild_west/spinJack/gold.png',
    'res/wild_west/spinJack/gun.png',
    'res/wild_west/spinJack/hat.png',
    'res/wild_west/spinJack/head.png',
    'res/wild_west/spinJack/money.png',
    'res/wild_west/spinJack/tecila.png'
]; // Символы для барабанов

let reels = [[], [], [], []]; // Состояние барабанов
let spinning = false; // Флаг вращения
let reelElements = [];
let score;

export function setupSpinJack() {
    score = localStorage.getItem('score') || 0;
    reelElements = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
        document.getElementById('reel4'),
    ];

    document.getElementById('currentBetSpinJack').textContent = 10; // Заглушка ставки
    document.getElementById('scoreValue').textContent = score;

    const plusBetButton = document.getElementById('plusBetSpinJack'); // Кнопка запуска
    const minusBetButton = document.getElementById('minusBetSpinJack'); // Кнопка запуска

    plusBetButton.disabled = false; // Блокируем кнопку на время вращения
    minusBetButton.disabled = false; // Блокируем кнопку на время вращения

    // Инициализация
    initializeReels();
}

let luckFactor = 1.0; // Коэффициент удачи (1.0 = всегда джекпот, 0.0 = случайный результат)

// Генерация случайного символа
function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Инициализация барабанов
function initializeReels() {
    reels.forEach((reel, index) => {
        for (let i = 0; i < 8; i++) {
            reel.push(getRandomSymbol());
        }
        updateReelDisplay(index);
    });
}

// Обновление отображения барабана
function updateReelDisplay(index) {
    reelElements[index].innerHTML = reels[index]
        .slice(0, 5) // Показываем первые 5 символов
        .map(symbol => `${addItem(symbol)}`)
        .join('');
}

function addItem(src) {
    return `
        <div class="item">
            <img src="${src}">
        </div>
    `;
}

// Функция вращения барабанов
function spinReels() {
    const spinButton = document.getElementById('spinSpinJackButton'); // Кнопка запуска
    const plusBetButton = document.getElementById('plusBetSpinJack'); // Кнопка запуска
    const minusBetButton = document.getElementById('minusBetSpinJack'); // Кнопка запуска

    if (spinning) return; // Если уже идёт вращение, игнорируем нажатие
    spinning = true; // Устанавливаем флаг вращения
    spinButton.disabled = true; // Блокируем кнопку на время вращения
    plusBetButton.disabled = true; // Блокируем кнопку на время вращения
    minusBetButton.disabled = true; // Блокируем кнопку на время вращения

    const spinPromises = reels.map((_, index) => {
        return new Promise((resolve) => {
            startReelSpin(index);
            setTimeout(() => {
                stopReelSpin(index, resolve); // Плавная остановка барабана
            }, 1000 + index * 500); // Увеличиваем задержку для каждого барабана
        });
    });

    // Применяем коэффициент удачи до завершения вращений
    enforceLuckDuringSpin();

    // Ждем завершения вращений
    Promise.all(spinPromises).then(() => {
        spinning = false; // Сбрасываем флаг вращения
        logVisibleSymbols(); // Логируем результат центральной строки
        analyzeWinning(); // Анализируем выигрыш
    });
}

// Начать вращение барабана
function startReelSpin(index) {
    slotEffect();
    const intervalId = setInterval(() => {
        const first = reels[index].shift(); // Убираем первый элемент
        reels[index].push(getRandomSymbol()); // Добавляем новый случайный символ
        updateReelDisplay(index);
    }, 50); // Скорость вращения

    reelElements[index].dataset.intervalId = intervalId; // Сохраняем ID интервала
}

// Плавная остановка барабана
function stopReelSpin(index, resolve) {
    const reel = reelElements[index];
    let intervalId = reel.dataset.intervalId;

    clearInterval(intervalId); // Сначала останавливаем текущее вращение
    let remainingSpins = 5; // Количество оставшихся "плавных" прокрутов
    let speed = 100; // Начальная скорость плавного замедления

    intervalId = setInterval(() => {
        const first = reels[index].shift(); // Убираем первый элемент
        reels[index].push(getRandomSymbol()); // Добавляем новый символ
        updateReelDisplay(index);

        remainingSpins--;
        speed += 50; // Увеличиваем задержку для плавного торможения

        if (remainingSpins <= 0) {
            clearInterval(intervalId); // Останавливаем вращение окончательно
            resolve(); // Сообщаем о завершении остановки
        }
    }, speed);
}

// Применение коэффициента удачи до завершения вращений
function enforceLuckDuringSpin() {
    if (Math.random() < luckFactor) {
        // Выбираем джекпот-символ
        const jackpotSymbol = getRandomSymbol();

        // Обновляем центральную строку на барабанах
        reels.forEach((reel) => {
            reel[2] = jackpotSymbol; // Ставим джекпот в центральную строку
        });
    }
}

// Логирование центральной строки
function logVisibleSymbols() {
    const centralRowSymbols = reels.map(reel => reel[2]); // Извлекаем 3-й символ из каждого барабана
    console.log('Central row result:', centralRowSymbols.join(' | '));
}

// Анализ центральной строки для определения выигрыша
function analyzeWinning() {
    let skipResult = false;
    const centralRowSymbols = reels.map(reel => reel[2]); // Извлекаем 3-й символ из каждого барабана
    const symbolCount = centralRowSymbols.reduce((counts, symbol) => {
        counts[symbol] = (counts[symbol] || 0) + 1;
        return counts;
    }, {});

    // Определяем максимальное количество совпадений
    const maxCount = Math.max(...Object.values(symbolCount));

    let winAmount = 0;
    if (maxCount === 4) {
        winAmount = 2; // 4 одинаковых
    } else if (maxCount === 3) {
        winAmount = 1.5; // 3 одинаковых
    } else if (maxCount === 2) {
        winAmount = 1; // 2 одинаковых
    }

    let currentBet = document.getElementById('currentBetSpinJack').innerText; // Заглушка ставки
    let result = parseFloat(winAmount) * parseFloat(currentBet);

    localStorage.setItem('score', parseFloat(score) + result);

    if (result !== 0) {
        highlightThirdRow();
    }

    // Проверка, находится ли пользователь на игровом экране
    if (!isCurrentScreen('spinJackPage')) {
        skipResult = true; // Принудительно пропускаем результат, если экран сменился
    }

    // Проверяем, нужно ли показывать результат и обновлять счёт
    if (!skipResult) {
        setTimeout(() => {
            localStorage.setItem('lastGame', 'spinJackPage');

            if (result !== 0) {
                switchScreen('winPage', result, 'url(../res/wild_west/spin_jack_bg.png) no-repeat')
            } else {
                switchScreen('failPage')
            }
        }, 1000);
    }
    const spinButton = document.getElementById('spinSpinJackButton'); // Кнопка запуска
    const plusBetButton = document.getElementById('plusBetSpinJack'); // Кнопка запуска
    const minusBetButton = document.getElementById('minusBetSpinJack'); // Кнопка запуска

    spinButton.disabled = false; // Разблокируем кнопку
    plusBetButton.disabled = false; // Разблокируем кнопку
    minusBetButton.disabled = false; // Разблокируем кнопку
}

function highlightThirdRow() {
    // Получаем все элементы барабанов
    const reels = document.querySelectorAll('.reel');

    // Проходим по каждому барабану
    reels.forEach(reel => {
        // Получаем все строки в текущем барабане
        const rows = reel.querySelectorAll('.item');

        // Если третья строка существует, добавляем к ней класс для подсветки
        if (rows[2]) {
            const thirdCell = document.createElement('div'); // Создаем третью ячейку, если ее нет
            thirdCell.classList.add('highlight'); // Добавляем базовый класс и эффект
            rows[2].appendChild(thirdCell); // Добавить третью ячейку в барабан
        }
    });
}

const minusBetRBtn = document.getElementById('minusBetSpinJack');
if (minusBetRBtn) {
    minusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetSpinJack');
        if (bet.innerText > 0 && bet.innerText !== '10') {
            bet.innerText = parseFloat(bet.innerText) - 10;
        }
    });
}

const plusBetRBtn = document.getElementById('plusBetSpinJack');
if (plusBetRBtn) {
    plusBetRBtn.addEventListener('click', () => {
        let bet = document.getElementById('currentBetSpinJack');
        let currentBet = parseFloat(bet.innerText);

        if (currentBet + 10 <= score) {
            bet.innerText = currentBet + 10;
        }
    });
}

// Обработчик нажатия кнопки
document.getElementById('spinSpinJackButton').addEventListener('click', spinReels);
