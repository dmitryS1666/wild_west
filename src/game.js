import {loadProgress, runMusic, saveProgress, tapSound, timeOutSound} from './settings.js';
import {switchScreen} from './ui.js';

const MAX_QUESTIONS_PER_ROUND = 10;
let mainPoints, extraPoints;

localStorage.setItem('extraPoints', 6);

// GAME
// Запуск основного игрового процесса
function startMainGame() {
    mainPoints = parseInt(localStorage.getItem('mainPoints')) || 0;
    extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0;
    const currentQuestionIndex = loadProgress();

    showInfoBlock(true);

    // Обновляем прогресс на экране
    updateProgressPage(currentQuestionIndex);

    const scoreValue = document.getElementById("scoreValue");
    if (scoreValue) {
        scoreValue.textContent = `${mainPoints}`;
    }

    updateExtraPointsDisplay();

    switchScreen('questionGame'); // Переходим на экран игры
    loadQuestions().then(questions => {
        showQuestion(currentQuestionIndex, questions); // Показать вопрос с текущего индекса
    });
}

// Функция для сброса прогресса
function resetProgress() {
    localStorage.removeItem('currentQuestionIndex'); // Удаляем индекс текущего вопроса
    updateProgressPage(0); // Обновляем страницу прогресса, устанавливая ее на 0
}

// Отображение основного вопроса игры
export let timer; // Переменная для таймера
async function showQuestion(currentQuestionIndex, questions) {
    const question = questions[currentQuestionIndex]; // Берем вопрос по индексу
    displayMainsQuestion(question, currentQuestionIndex);

    // Обновляем классы на progressPage
    updateProgressPage(currentQuestionIndex);
    // Запускаем таймер на 12 секунд
    startTimer(120);
    showInfoBlock(true);
}

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
    const currentQuestionIndex = loadProgress();
    updateProgressPage(currentQuestionIndex);
    let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0; // Получаем текущие extra points
    if (extraPoints > 0) {
        switchScreen('finalAnswerPage', false);
    } else {
        switchScreen('failPage');
        resetProgress();
    }
}

function displayMainsQuestion(question, currentQuestionIndex) {
    const questionElement = document.querySelector('#questionGame .question');
    const answerElements = document.querySelectorAll('#questionGame .item');

    questionElement.innerText = question.question;

    answerElements.forEach((element, index) => {
        element.querySelector('.text').innerHTML = `<b>${String.fromCharCode(65 + index)}:</b> ${question.answers[index]}`;
        element.onclick = () => handleMainAnswer(index, question.correct, currentQuestionIndex);
    });
}

// Обработка ответа на основной вопрос
function handleMainAnswer(selectedIndex, correctIndex, currentQuestionIndex) {
    tapSound.play();

    clearInterval(timer); // Очищаем таймер при выборе ответа
    // Получаем очки за текущий уровень
    const currentItem = document.querySelector(`#progressPage .levels .item[data-level="${currentQuestionIndex + 1}"]`);
    const levelScore = parseInt(currentItem.getAttribute('data-score'));

    const scoreValue = document.getElementById("scoreValue");
    if (scoreValue) {
        scoreValue.textContent = `${mainPoints}`;
    }

    updateExtraPointsDisplay();

    // Сохраняем дату последнего ответа на вопрос
    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastQuestionDate', today);

    // Объект для хранения прогресса
    let gameProgress = {
        currentQuestionIndex: currentQuestionIndex,
        answeredCorrectly: false // По умолчанию неверный ответ
    };

    // Правильный ответ
    if (selectedIndex === correctIndex) {
        mainPoints += levelScore; // Добавляем очки за текущий уровень
        localStorage.setItem('mainPoints', mainPoints); // Сохраняем обновленные очки
        gameProgress.answeredCorrectly = true; // Обновляем статус ответа
        currentQuestionIndex++; // Переходим к следующему вопросу
        saveProgress(currentQuestionIndex); // Сохраняем прогресс

        // Добавляем класс done к текущему вопросу
        updateProgressPage(currentQuestionIndex);

        // Отображаем экран победы
        switchScreen('winPage', false, levelScore);

        if (currentQuestionIndex >= MAX_QUESTIONS_PER_ROUND) {
            resetProgress();
        }
    } else {
        // Неправильный ответ
        let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0; // Получаем текущие extra points
        if (extraPoints > 0) {
            switchScreen('finalAnswerPage', false);
        } else {
            switchScreen('failPage'); // Переход на экран проигрыша
            resetProgress(); // Сброс прогресса, конец игры
        }
    }
}

// Функция для обновления прогресса на экране progressPage
function updateProgressPage(currentQuestionIndex) {
    const levelItems = document.querySelectorAll('#progressPage .levels .item');

    levelItems.forEach(item => {
        const levelIndex = parseInt(item.getAttribute('data-level')); // Получаем индекс уровня из data-level
        item.classList.remove('active', 'done'); // Убираем все классы

        if (levelIndex < currentQuestionIndex + 1) {
            item.classList.add('done'); // Добавляем done для пройденных вопросов
        }

        if (levelIndex === currentQuestionIndex + 1) {
            item.classList.add('active'); // Добавляем active для текущего вопроса
        }
    });
}

// Загрузка основных вопросов игры
async function loadQuestions() {
    // Проверяем, есть ли перемешанные вопросы в localStorage
    let questions = JSON.parse(localStorage.getItem('shuffledQuestions')); // Правильное извлечение

    // Если вопросов нет в localStorage, загружаем их из исходного файла и сохраняем в localStorage
    if (!questions) {
        localStorage.setItem('shuffledQuestions', JSON.stringify('questions')); // Сохраняем массив вопросов в localStorage
    }

    return questions;  // Возвращаем перемешанные вопросы
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
    loadQuestions,
    showQuestion,
    startMainGame,
    updateProgressPage,
    loadProgress,
    showInfoBlock,
    updateExtraPointsDisplay
};
