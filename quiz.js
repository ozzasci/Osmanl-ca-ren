let quizData = [];
let currentQuestion = 0;
let score = 0;
let quizMode = 'test';
let usedQuestionIndices = [];
let userAnswers = [];

// Elementler
const elements = {
    questionText: document.getElementById('questionText'),
    questionTypeBadge: document.getElementById('questionTypeBadge'),
    osmanlicaPreview: document.getElementById('osmanlicaPreview'),
    answerButtons: document.getElementById('answerButtons'),
    writtenQuestion: document.getElementById('writtenQuestion'),
    writtenQuestionType: document.getElementById('writtenQuestionType'),
    osmanlicaWrittenPreview: document.getElementById('osmanlicaWrittenPreview'),
    writtenAnswer: document.getElementById('writtenAnswer'),
    answerFeedback: document.getElementById('answerFeedback'),
    checkAnswerBtn: document.getElementById('checkAnswerBtn'),
    resultCard: document.getElementById('resultCard'),
    scoreText: document.getElementById('scoreText'),
    restartQuizBtn: document.getElementById('restartQuizBtn'),
    quizProgress: document.getElementById('quizProgress'),
    progressText: document.getElementById('progressText'),
    testModuBtn: document.getElementById('testModuBtn'),
    yaziliModuBtn: document.getElementById('yaziliModuBtn'),
    testModu: document.getElementById('testModu'),
    yaziliModu: document.getElementById('yaziliModu')
};

// Quiz başlat
function startQuiz() {
    const savedLists = localStorage.getItem('osmanlicaKelimeListeleri');
    if (savedLists) {
        const allLists = JSON.parse(savedLists);
        quizData = Object.values(allLists).flat();
        
        if (quizData.length < 4) {
            alert('Quiz yapmak için en az 4 kelime ekleyin!');
            window.location.href = 'index.html';
            return;
        }
        
        shuffleQuestions();
        loadQuestion();
    } else {
        alert('Quiz yapmak için önce ana sayfadan kelime ekleyin!');
        window.location.href = 'index.html';
    }
}

// Soruları karıştır
function shuffleQuestions() {
    usedQuestionIndices = [];
    userAnswers = [];
    const questionCount = Math.min(10, quizData.length);
    
    while (usedQuestionIndices.length < questionCount) {
        const randomIndex = Math.floor(Math.random() * quizData.length);
        if (!usedQuestionIndices.includes(randomIndex)) {
            usedQuestionIndices.push(randomIndex);
        }
    }
    
    currentQuestion = 0;
    score = 0;
    updateProgress();
}

// Soruyu yükle
function loadQuestion() {
    if (currentQuestion >= usedQuestionIndices.length) {
        showResults();
        return;
    }

    const questionIndex = usedQuestionIndices[currentQuestion];
    const question = quizData[questionIndex];

    if (quizMode === 'test') {
        elements.testModu.style.display = 'block';
        elements.yaziliModu.style.display = 'none';
        
        if (Math.random() > 0.5) {
            elements.questionTypeBadge.textContent = "Anlam";
            elements.questionText.textContent = "Aşağıdaki kelimenin anlamı nedir?";
            elements.osmanlicaPreview.textContent = question.word;
            
            const correctAnswer = question.meaning;
            const answers = [correctAnswer, ...getRandomAnswers(correctAnswer, 'meaning')];
            
            elements.answerButtons.innerHTML = '';
            shuffleArray(answers).forEach(answer => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline-primary answer-btn py-2';
                button.innerHTML = `<i class="bi bi-question-circle"></i> ${answer}`;
                button.addEventListener('click', () => checkAnswer(answer, correctAnswer, question));
                elements.answerButtons.appendChild(button);
            });
        } else {
            elements.questionTypeBadge.textContent = "Kelime";
            elements.questionText.textContent = `"${question.meaning}" anlamına gelen kelime hangisidir?`;
            elements.osmanlicaPreview.textContent = "";
            
            const correctAnswer = question.word;
            const answers = [correctAnswer, ...getRandomAnswers(correctAnswer, 'word')];
            
            elements.answerButtons.innerHTML = '';
            shuffleArray(answers).forEach(answer => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline-primary answer-btn py-2';
                button.innerHTML = `<i class="bi bi-translate"></i> ${answer}`;
                button.addEventListener('click', () => checkAnswer(answer, correctAnswer, question));
                elements.answerButtons.appendChild(button);
            });
        }
    } else {
        elements.testModu.style.display = 'none';
        elements.yaziliModu.style.display = 'block';
        
        if (Math.random() > 0.5) {
            elements.writtenQuestionType.textContent = "Anlam";
            elements.writtenQuestion.textContent = "Aşağıdaki kelimenin anlamı nedir?";
            elements.osmanlicaWrittenPreview.textContent = question.word;
            elements.writtenAnswer.placeholder = "Anlamını yazın...";
            elements.writtenAnswer.dataset.correctAnswer = question.meaning;
            elements.writtenAnswer.dataset.questionType = "meaning";
        } else {
            elements.writtenQuestionType.textContent = "Okunuş";
            elements.writtenQuestion.textContent = "Aşağıdaki kelimenin okunuşu nedir?";
            elements.osmanlicaWrittenPreview.textContent = question.word;
            elements.writtenAnswer.placeholder = "Okunuşunu yazın...";
            elements.writtenAnswer.dataset.correctAnswer = question.transliteration;
            elements.writtenAnswer.dataset.questionType = "transliteration";
        }
        
        elements.writtenAnswer.value = '';
        elements.answerFeedback.textContent = '';
        elements.writtenAnswer.dataset.questionIndex = questionIndex;
    }
}

// Rastgele yanlış cevaplar al
function getRandomAnswers(correctAnswer, field) {
    let wrongs = [];
    while (wrongs.length < 3) {
        const random = quizData[Math.floor(Math.random() * quizData.length)];
        const randomAnswer = random[field];
        if (randomAnswer !== correctAnswer && !wrongs.includes(randomAnswer)) {
            wrongs.push(randomAnswer);
        }
    }
    return wrongs;
}

// Dizi karıştırma
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Cevap kontrolü (test modu)
function checkAnswer(selectedAnswer, correctAnswer, question) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent.includes(correctAnswer)) {
            button.classList.add('correct');
            button.innerHTML = `<i class="bi bi-check-circle"></i> ${button.textContent.replace('bi-question-circle', 'bi-check-circle')}`;
        } else if (button.textContent.includes(selectedAnswer)) {
            button.classList.add('incorrect');
            button.innerHTML = `<i class="bi bi-x-circle"></i> ${button.textContent.replace('bi-question-circle', 'bi-x-circle')}`;
        }
    });

    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
        score++;
    }

    userAnswers.push({
        question,
        userAnswer: selectedAnswer,
        isCorrect,
        questionType: elements.questionTypeBadge.textContent.toLowerCase()
    });

    setTimeout(() => {
        currentQuestion++;
        updateProgress();
        loadQuestion();
    }, 1500);
}

// Yazılı cevap kontrolü
elements.checkAnswerBtn.addEventListener('click', () => {
    const correctAnswer = elements.writtenAnswer.dataset.correctAnswer.toLowerCase();
    const userAnswer = elements.writtenAnswer.value.trim().toLowerCase();
    const questionIndex = elements.writtenAnswer.dataset.questionIndex;
    const questionType = elements.writtenAnswer.dataset.questionType;
    const question = quizData[questionIndex];
    
    if (!userAnswer) {
        alert('Lütfen bir cevap yazın!');
        return;
    }

    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) {
        elements.answerFeedback.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> ✅ Doğru Cevap!</div>';
        score++;
    } else {
        elements.answerFeedback.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-x-circle"></i> ❌ Yanlış Cevap! 
                <div class="mt-2">Doğru cevap: <strong>${correctAnswer}</strong></div>
            </div>
        `;
    }

    userAnswers.push({
        question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect,
        questionType
    });

    setTimeout(() => {
        currentQuestion++;
        updateProgress();
        loadQuestion();
    }, 2000);
});

// Sonuçları göster
function showResults() {
    elements.testModu.style.display = 'none';
    elements.yaziliModu.style.display = 'none';
    elements.resultCard.style.display = 'block';
    
    const total = usedQuestionIndices.length;
    const percentage = Math.round((score / total) * 100);
    let resultEmoji = "😊";
    
    if (percentage >= 80) resultEmoji = "🎉";
    else if (percentage >= 50) resultEmoji = "👍";
    else resultEmoji = "🤔";
    
    elements.scoreText.innerHTML = `Skor: <strong>${score}/${total}</strong> (${percentage}%) ${resultEmoji}`;
    
    // Detaylı rapor oluştur
    let reportHTML = `
        <div class="mt-4">
            <h5 class="mb-3"><i class="bi bi-list-check"></i> Detaylı Sonuçlar</h5>
            <div class="table-responsive">
                <table class="table table-bordered result-table">
                    <thead>
                        <tr>
                            <th><i class="bi bi-question-circle"></i> Soru</th>
                            <th><i class="bi bi-person"></i> Senin Cevabın</th>
                            <th><i class="bi bi-check-circle"></i> Doğru Cevap</th>
                            <th><i class="bi bi-clipboard-check"></i> Durum</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    userAnswers.forEach((answer, index) => {
        const questionText = answer.questionType === 'meaning' 
            ? answer.question.word 
            : answer.question.meaning;
        
        const userAnswerText = answer.userAnswer || "Boş";
        const correctAnswerText = answer.questionType === 'meaning' 
            ? answer.question.meaning 
            : answer.question.transliteration;
        
        reportHTML += `
            <tr>
                <td>${questionText}</td>
                <td>${userAnswerText}</td>
                <td>${correctAnswerText}</td>
                <td class="${answer.isCorrect ? 'text-success' : 'text-danger'}">
                    ${answer.isCorrect ? '<i class="bi bi-check-circle"></i> Doğru' : '<i class="bi bi-x-circle"></i> Yanlış'}
                </td>
            </tr>
        `;
    });

    reportHTML += `
                    </tbody>
                </table>
            </div>
            
            <div class="d-flex justify-content-between mt-4">
                <button id="restartQuizBtn" class="btn btn-success">
                    <i class="bi bi-arrow-repeat"></i> Tekrar Başlat
                </button>
                <a href="index.html" class="btn btn-outline-primary">
                    <i class="bi bi-house"></i> Ana Sayfa
                </a>
            </div>
        </div>
    `;

    elements.resultCard.innerHTML += reportHTML;
    
    // Yeniden başlat butonunu etkinleştir
    document.getElementById('restartQuizBtn').addEventListener('click', () => {
        elements.resultCard.style.display = 'none';
        elements.resultCard.innerHTML = `
            <div class="card-body">
                <h4 class="mb-3"><i class="bi bi-award"></i> Quiz Tamamlandı!</h4>
                <p id="scoreText" class="fs-4">Skor: 0/0</p>
            </div>
        `;
        shuffleQuestions();
        loadQuestion();
    });
}

// İlerlemeyi güncelle
function updateProgress() {
    const progress = (currentQuestion / usedQuestionIndices.length) * 100;
    elements.quizProgress.style.width = `${progress}%`;
    elements.progressText.textContent = `${currentQuestion}/${usedQuestionIndices.length}`;
}

// Quiz modu değiştir
elements.testModuBtn.addEventListener('click', () => {
    quizMode = 'test';
    elements.testModuBtn.classList.add('active');
    elements.yaziliModuBtn.classList.remove('active');
    shuffleQuestions();
    loadQuestion();
});

elements.yaziliModuBtn.addEventListener('click', () => {
    quizMode = 'yazili';
    elements.yaziliModuBtn.classList.add('active');
    elements.testModuBtn.classList.remove('active');
    shuffleQuestions();
    loadQuestion();
});

// Tema değiştirme
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.body.className = `${this.dataset.theme}-theme`;
        localStorage.setItem('osmanlicaTheme', this.dataset.theme);
    });
});

// Sayfa yüklendiğinde
window.addEventListener('load', () => {
    // Tema yükle
    const savedTheme = localStorage.getItem('osmanlicaTheme') || 'light';
    document.body.className = `${savedTheme}-theme`;
    document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`).classList.add('active');
    
    // Quiz başlat
    startQuiz();
});