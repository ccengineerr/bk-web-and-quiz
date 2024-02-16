const quizContainer = document.querySelector('.quiz-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const resultElement = document.getElementById('result');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const countdownElement = document.getElementById('countdown');
let currentQuestionIndex = 0;
let userAnswers = [];
let questions = [];
let countdownTimer;

async function fetchQuestions() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        const shuffledQuestions = shuffleArray(data).slice(0, 10);
        return shuffledQuestions.map((question, index) => ({
            ...question,
            title: `${index + 1}. ${question.title}`
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayQuestion(question) {
    questionElement.textContent = question.title;
    const options = parseOptions(question.body);
    optionsElement.innerHTML = '';
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.classList.add('option');
        button.dataset.index = index;
        button.addEventListener('click', () => answerQuestion(index));
        optionsElement.appendChild(button);
    });
    startCountdown();
}

function parseOptions(body) {
    const options = body.split('\n').filter(option => option.trim().length > 0);
    const correctIndex = Math.floor(Math.random() * options.length);
    const formattedOptions = options.map((option, index) => {
        let optionText = option.replace(/^\* /, '');
        let optionLetter = String.fromCharCode(65 + index);
        return {
            text: `${optionLetter}. ${optionText}`,
            isCorrect: index === correctIndex
        };
    });
    return formattedOptions;
}


function answerQuestion(index) {
    const questionIndex = currentQuestionIndex;
    userAnswers[questionIndex] = index;
    const options = optionsElement.querySelectorAll('.option');
    options.forEach(option => option.disabled = true);
    clearTimeout(countdownTimer);
    nextQuestion();
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        displayResult();
        questionElement.textContent = '';
        optionsElement.innerHTML = '';
    }
}

function displayResult() {
    let score = 0;
    resultElement.innerHTML = '<h2>Quiz Result</h2>';
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    questions.forEach((question, index) => {
        const tr = document.createElement('tr');
        const userAnswerIndex = userAnswers[index];
        const selectedOption = question.options[userAnswerIndex];
        const isCorrect = selectedOption.isCorrect;
        score += isCorrect ? 10 : 0;
        tr.innerHTML = `
            
            <td>${question.title}</td>
            <td>${isCorrect ? 'Correct' : 'Incorrect'}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultElement.appendChild(table);
    resultElement.innerHTML += `<p>Total Score: ${score}</p>`;
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
}

function startCountdown() {
    let countdown = 30;
    countdownElement.textContent = countdown;
    
    const options = optionsElement.querySelectorAll('.option');
    options.forEach(option => option.disabled = true);

    setTimeout(() => {
        options.forEach(option => option.disabled = false);
    }, 10000);

    countdownTimer = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown === 0) {
            clearInterval(countdownTimer);
            nextQuestion();
        }
    }, 1000);
}


async function startQuiz() {
    questions = await fetchQuestions();
    if (questions.length === 10) {
        startButton.addEventListener('click', () => {
            startButton.style.display = 'none';
            restartButton.style.display = 'none';
            currentQuestionIndex = 0;
            userAnswers = [];
            resultElement.innerHTML = '';
            questions.forEach(question => {
                question.options = parseOptions(question.body);
            });
            displayQuestion(questions[0]);
        });
    } else {
        quizContainer.innerHTML = '<p>Failed to load questions.</p>';
    }
}

restartButton.addEventListener('click', () => {
    startButton.style.display = 'block';
    restartButton.style.display = 'none';
});

startQuiz();
