import {loadProgress, runMusic, saveProgress, tapSound, timeOutSound} from './settings.js';
import {switchScreen} from './ui.js';

const MAX_QUESTIONS_PER_ROUND = 10;
let mainPoints, extraPoints;

localStorage.setItem('extraPoints', 6);

let usedHint5050 = false;
let usedHintFriend = false;
let usedHintAudience = false;

// GAME
// Запуск основного игрового процесса
function startMainGame() {
    mainPoints = parseInt(localStorage.getItem('mainPoints')) || 0;
    extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0;
    const currentQuestionIndex = loadProgress();

    showInfoBlock(true);
    showHintBlock(extraPoints);

    // Обновляем прогресс на экране
    updateProgressPage(currentQuestionIndex);

    const scoreValue = document.getElementById("scoreValue");
    if (scoreValue) {
        scoreValue.textContent = `${mainPoints}`;
    }

    updateExtraPointsDisplay();
    cleanHintResult();

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
            resetHints();
        }
    } else {
        // Неправильный ответ
        let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0; // Получаем текущие extra points
        if (extraPoints > 0) {
            switchScreen('finalAnswerPage', false);
        } else {
            switchScreen('failPage'); // Переход на экран проигрыша
            resetProgress(); // Сброс прогресса, конец игры
            resetHints();
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
function checkQuestionOfTheDay() {
    runMusic();
    const lastQuestionDate = localStorage.getItem('lastQuestionDate');
    const today = new Date().toLocaleDateString();

    if (lastQuestionDate !== today) {
        showQuestionOfTheDay();
    } else {
        switchScreen('progressPage');
        const scoreValue = document.getElementById("scoreValue");
        if (scoreValue) {
            scoreValue.textContent = `${mainPoints}`;
        }
        showInfoBlock(true);
    }
}

// Загрузка вопросов дня из файла JSON
async function loadDailyQuestions() {
    const response = await fetch('questions.json');
    const questions = await response.json();
    return questions;
}

// Показать вопрос дня
async function showQuestionOfTheDay() {
    switchScreen('questionDay');
    showInfoBlock(true);

    const questions = await loadDailyQuestions();
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    displayDailyQuestion(question);
}

// Отображение вопроса дня и вариантов ответов
function displayDailyQuestion(question) {
    const questionElement = document.querySelector('#questionDay .question');
    const answerElements = document.querySelectorAll('#questionDay .item');

    questionElement.innerText = question.question;

    answerElements.forEach((element, index) => {
        element.querySelector('.text').innerHTML = `<b>${String.fromCharCode(65 + index)}:</b> ${question.answers[index]}`;
        element.onclick = () => handleDailyAnswer(index, question.correct);
    });
}

// Обработка ответа на вопрос дня
function handleDailyAnswer(selectedIndex, correctIndex) {
    tapSound.play();

    // let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0; // Приводим к числу или устанавливаем 0, если нет

    // Сохраняем дату последнего ответа на вопрос дня
    const today = new Date().toLocaleDateString();
    localStorage.setItem('lastQuestionDate', today);

    showInfoBlock(true);

    // if (selectedIndex === correctIndex) {
    //     extraPoints += 2; // Добавляем 2 extra points за правильный ответ
    //     localStorage.setItem('extraPoints', extraPoints); // Сохраняем обновленные extra points
    //     switchScreen('winPage', true);
    // } else {
        switchScreen('failPage');
    // }
}

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

    showHintBlock(extraPoints);
}

// HINT SECTION
function showHintBlock(extraPoints) {
    let fiftyOnFiftyBtn = document.getElementById('fiftyOnFifty');
    let callBtn = document.getElementById('call');
    let audienceBtn = document.getElementById('audience');

    if (extraPoints > 0) {
        audienceBtn.classList.remove('block');
        audienceBtn.classList.add('active');

        callBtn.classList.remove('block');
        callBtn.classList.add('active');

        fiftyOnFiftyBtn.classList.remove('block');
        fiftyOnFiftyBtn.classList.add('active');
    } else {
        audienceBtn.classList.remove('active');
        audienceBtn.classList.add('block');

        callBtn.classList.remove('active');
        callBtn.classList.add('block');

        fiftyOnFiftyBtn.classList.remove('active');
        fiftyOnFiftyBtn.classList.add('block');
    }
}

function resetHints() {
    usedHint5050 = false;
    usedHintFriend = false;
    usedHintAudience = false;

    // Разблокируем кнопки подсказок
    const hintButtons = document.querySelectorAll('#hintAudience, #fiftyOnFifty, #call');
    hintButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('block');
        button.classList.add('active');
    });

    updateExtraPointsDisplay(); // Обновляем отображение подсказок
}

function useHint5050() {
    const currentQuestionIndex = loadProgress();
    loadQuestions().then(questions => {
        const question = questions[currentQuestionIndex];
        const incorrectAnswers = [];

        // Собираем индексы всех неправильных ответов
        question.answers.forEach((answer, index) => {
            if (index !== question.correct) {
                incorrectAnswers.push(index);
            }
        });

        // Перемешиваем неправильные ответы и выбираем два для скрытия
        shuffleArray(incorrectAnswers);
        const [first, second] = incorrectAnswers.slice(0, 2);

        // Прячем выбранные два ответа
        const answerElements = document.querySelectorAll('#questionGame .item');
        answerElements[first].classList.add('closed');
        answerElements[second].classList.add('closed');

        extraPoints -= 2;
        localStorage.setItem('extraPoints', extraPoints)
        updateExtraPointsDisplay();

        document.getElementById('fiftyOnFifty').classList.add('block');
    });
}

function useHintFriend() {
    const currentQuestionIndex = loadProgress();
    loadQuestions().then(questions => {
        const question = questions[currentQuestionIndex];

        // Генерируем вероятность того, что друг знает правильный ответ
        const knowsCorrectAnswer = Math.random() < 0.7;

        let suggestedAnswer;
        if (knowsCorrectAnswer) {
            suggestedAnswer = question.correct; // Друг знает правильный ответ
        } else {
            // Случайный неправильный ответ
            const incorrectAnswers = question.answers.map((_, index) => index).filter(index => index !== question.correct);
            suggestedAnswer = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
        }

        // подсвечиваем выбранный ответ
        const answerElements = document.querySelectorAll('#questionGame .item');
        answerElements.forEach((answer, index) => {
            if (index === suggestedAnswer) {
                answer.classList.add('selected');
            } else {
                answer.classList.add('unselected');
            }
        });

        extraPoints -= 2;
        localStorage.setItem('extraPoints', extraPoints)
        updateExtraPointsDisplay();

        document.getElementById('call').classList.add('block');
    });
}

function cleanHintResult() {
    const answerElements = document.querySelectorAll('#questionGame .item');
    answerElements.forEach((answer, index) => {
        answer.classList.remove('unselected');
        answer.classList.remove('selected');
        answer.classList.remove('closed');
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export {
    checkQuestionOfTheDay,
    loadQuestions,
    showQuestion,
    startMainGame,
    updateProgressPage,
    loadProgress,
    showInfoBlock,
    updateExtraPointsDisplay
};
