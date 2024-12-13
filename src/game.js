import {runMusic, tapSound, timeOutSound} from './settings.js';
import {switchScreen} from './ui.js';

localStorage.setItem('extraPoints', 6);

// Отображение основного вопроса игры
export let timer; // Переменная для таймера

// Запуск таймера
function startTimer(seconds) {
    let timeLeft = seconds;
    const timerDisplays = document.querySelectorAll('#timer span'); // Обновляем span внутри элемента с id "timer"

    // Обновляем отображение таймера каждую секунду
    timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60); // Получаем минуты
        const seconds = timeLeft % 60; // Получаем секунды

        // Форматируем время в формате 00:12
        timerDisplays.forEach((timerDisplay, index) => {
            timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        });
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer); // Очищаем интервал
            handleTimeUp(); // Обрабатываем истечение времени
        }
    }, 1000);
}

// Обработка истечения времени
function handleTimeUp() {
    clearInterval(timer); // Очищаем таймер
    timeOutSound.play();
    let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0; // Получаем текущие extra points
    if (extraPoints > 0) {
        switchScreen('finalAnswerPage', false);
    } else {
        switchScreen('failPage');
        resetProgress();
    }
}

// DAILY section
// Проверка даты последнего вопроса дня

function showInfoBlock(extraPoints) {
    const infoBlock = document.getElementById('containerConfig');
    infoBlock.classList.remove('hidden');

    const extraPointsBlock = document.getElementById('extraPoint');

    if (extraPoints) {
        extraPointsBlock.classList.remove('hidden');
    } else {
        extraPointsBlock.classList.add('hidden');
    }
}

function updateExtraPointsDisplay() {
    let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0;
    const extraPointsElements = document.querySelectorAll('#extraPoints');

    // Проставляем значение extraPoints для каждого найденного элемента
    extraPointsElements.forEach(element => {
        element.textContent = `${extraPoints}`;
    });
}

export {
    showInfoBlock,
    updateExtraPointsDisplay
};
