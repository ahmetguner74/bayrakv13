// DOM elementleri
const flagImage = document.getElementById('flag-image');
const options = document.querySelectorAll('.option');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const highScoreElement = document.getElementById('high-score');
const hintButton = document.getElementById('hint-btn');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');
const gameOverModal = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

// Ses efektleri
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const gameOverSound = document.getElementById('game-over-sound');
const hintSound = document.getElementById('hint-sound');
const tickSound = document.getElementById('tick-sound');

// Oyun değişkenleri
let currentFlag = null;
let score = 0;
let timeLeft = 30;
let timer = null;
let highScore = localStorage.getItem('highScore') || 0;
let hintsLeft = 3;
let isGameActive = false;
let countries = [];

// Bayrak verilerini yükle
async function loadFlags() {
    try {
        const response = await fetch('flags.json');
        if (!response.ok) {
            throw new Error('Bayrak verileri yüklenemedi');
        }
        countries = await response.json();
        console.log(`${countries.length} bayrak yüklendi`);
        return true;
    } catch (error) {
        console.error('Bayraklar yüklenirken hata oluştu:', error);
        alert('Bayrak verileri yüklenirken bir hata oluştu! Lütfen sayfayı yenileyin.');
        return false;
    }
}

// Yüksek skoru göster
highScoreElement.textContent = highScore;

// Rastgele sayı üretme fonksiyonu
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Rastgele 4 ülke seçme fonksiyonu
function getRandomCountries() {
    const selectedCountries = [];
    const tempCountries = [...countries];
    
    for (let i = 0; i < 4; i++) {
        if (tempCountries.length === 0) break;
        const randomIndex = getRandomInt(tempCountries.length);
        selectedCountries.push(tempCountries[randomIndex]);
        tempCountries.splice(randomIndex, 1);
    }
    
    return selectedCountries;
}

// Zamanlayıcı fonksiyonu
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeElement.textContent = timeLeft;
        if (timeLeft <= 5) {
            tickSound.play().catch(err => console.log('Ses çalma hatası:', err));
        }
    } else {
        endGame();
    }
}

// Oyunu başlatma fonksiyonu
async function startGame() {
    // Eğer bayraklar yüklenmediyse veya yükleme başarısız olduysa
    if (countries.length === 0) {
        const loaded = await loadFlags();
        if (!loaded) return;
    }

    isGameActive = true;
    score = 0;
    timeLeft = 30;
    hintsLeft = 3;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    hintButton.textContent = `İpucu (${hintsLeft})`;
    gameOverModal.classList.add('hidden');
    
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    createNewQuestion();
}

// Oyunu bitirme fonksiyonu
function endGame() {
    isGameActive = false;
    clearInterval(timer);
    gameOverSound.play().catch(err => console.log('Ses çalma hatası:', err));
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove('hidden');
}

// Yeni soru oluşturma fonksiyonu
function createNewQuestion() {
    if (countries.length < 4) {
        alert('Yeterli bayrak verisi yok!');
        endGame();
        return;
    }

    const selectedCountries = getRandomCountries();
    currentFlag = selectedCountries[getRandomInt(selectedCountries.length)];
    
    // Bayrağı göster
    flagImage.src = `public/flags/${currentFlag.code}.svg`;
    flagImage.alt = `${currentFlag.name_tr} bayrağı`;
    
    // Seçenekleri karıştır ve göster
    selectedCountries.sort(() => Math.random() - 0.5);
    options.forEach((option, index) => {
        option.textContent = selectedCountries[index].name_tr;
        option.classList.remove('correct', 'wrong', 'disabled');
    });
}

// İpucu fonksiyonu
function useHint() {
    if (hintsLeft > 0 && isGameActive) {
        hintsLeft--;
        hintButton.textContent = `İpucu (${hintsLeft})`;
        hintSound.play().catch(err => console.log('Ses çalma hatası:', err));
        
        // Yanlış iki seçeneği devre dışı bırak
        const wrongOptions = Array.from(options).filter(
            option => option.textContent !== currentFlag.name_tr
        );
        
        for (let i = 0; i < 2 && i < wrongOptions.length; i++) {
            const randomIndex = getRandomInt(wrongOptions.length);
            wrongOptions[randomIndex].classList.add('disabled');
            wrongOptions.splice(randomIndex, 1);
        }
    }
}

// Cevap kontrolü
function checkAnswer(selectedOption) {
    if (!isGameActive || selectedOption.classList.contains('disabled')) return;
    
    const selectedCountry = selectedOption.textContent;
    
    if (selectedCountry === currentFlag.name_tr) {
        selectedOption.classList.add('correct');
        score++;
        scoreElement.textContent = score;
        correctSound.play().catch(err => console.log('Ses çalma hatası:', err));
    } else {
        selectedOption.classList.add('wrong');
        options.forEach(option => {
            if (option.textContent === currentFlag.name_tr) {
                option.classList.add('correct');
            }
        });
        wrongSound.play().catch(err => console.log('Ses çalma hatası:', err));
    }
    
    // Tüm seçenekleri devre dışı bırak
    options.forEach(option => option.classList.add('disabled'));
    
    // 1 saniye sonra yeni soru
    setTimeout(createNewQuestion, 1000);
}

// Olay dinleyicileri
options.forEach(option => {
    option.addEventListener('click', function() {
        checkAnswer(this);
    });
});

hintButton.addEventListener('click', useHint);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Sayfa yüklendiğinde bayrakları yükle
loadFlags(); 