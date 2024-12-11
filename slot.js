const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍓', '⭐', '🔔']; // Символы для барабанов

let reels = [[], [], [], []]; // Состояние барабанов
let spinning = false; // Флаг вращения
const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3'),
    document.getElementById('reel4'),
];

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
        .map(symbol => `<div>${symbol}</div>`)
        .join('');
}

// Функция вращения барабанов
function spinReels() {
    if (spinning) return; // Если вращение уже идет, выходим
    spinning = true;

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
    const centralRowSymbols = reels.map(reel => reel[2]); // Извлекаем 3-й символ из каждого барабана
    const symbolCount = centralRowSymbols.reduce((counts, symbol) => {
        counts[symbol] = (counts[symbol] || 0) + 1;
        return counts;
    }, {});

    // Определяем максимальное количество совпадений
    const maxCount = Math.max(...Object.values(symbolCount));

    let winAmount = 0;
    if (maxCount === 4) {
        winAmount = 1; // 4 одинаковых
    } else if (maxCount === 3) {
        winAmount = 0.75; // 3 одинаковых
    } else if (maxCount === 2) {
        winAmount = 0.5; // 2 одинаковых
    }

    console.log(`Winning analysis: ${centralRowSymbols.join(' | ')}`);
    console.log(`Winning amount: ${winAmount}`);
}

// Обработчик нажатия кнопки
document.getElementById('spinButton').addEventListener('click', spinReels);

// Инициализация
initializeReels();
