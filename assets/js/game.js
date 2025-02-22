import { GAME_CONFIG, SOUND_CONFIG, LANGUAGE_CONFIG } from './config.js';
import { LanguageManager, SoundManager, AnimationManager, getRandomInt, shuffleArray, formatTime } from './utils.js';

class FlagGame {
    constructor() {
        console.log('FlagGame başlatılıyor...');
        this.initializeManagers();
        this.initializeGameState();
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeManagers() {
        console.log('Yöneticiler başlatılıyor...');
        this.languageManager = new LanguageManager(LANGUAGE_CONFIG);
        this.soundManager = new SoundManager(SOUND_CONFIG);
        this.difficulty = localStorage.getItem('difficulty') || 'MEDIUM';
    }

    initializeGameState() {
        console.log('Oyun durumu başlatılıyor...');
        this.countries = [];
        this.currentFlag = null;
        this.score = 0;
        this.timeLeft = GAME_CONFIG.DURATIONS[this.difficulty];
        this.hintsLeft = GAME_CONFIG.HINTS[this.difficulty];
        this.isGameActive = false;
        this.timer = null;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    }

    initializeElements() {
        console.log('DOM elementleri başlatılıyor...');
        this.elements = {
            flagImage: document.getElementById('flag-image'),
            options: document.querySelectorAll('.option'),
            score: document.getElementById('score'),
            time: document.getElementById('time'),
            highScore: document.getElementById('high-score'),
            hint: document.getElementById('hint-btn'),
            start: document.getElementById('start-btn'),
            restart: document.getElementById('restart-btn'),
            gameOver: document.getElementById('game-over'),
            finalScore: document.getElementById('final-score'),
            loading: document.getElementById('loading'),
            settings: document.getElementById('settings'),
            soundToggle: document.getElementById('sound-toggle'),
            volumeSlider: document.getElementById('volume-slider'),
            languageSelect: document.getElementById('language-select'),
            difficultySelect: document.getElementById('difficulty-select')
        };

        // Başlangıç değerlerini ayarla
        this.elements.highScore.textContent = this.highScore;
        this.elements.hint.textContent = `${this.languageManager.getText('hint')} (${this.hintsLeft})`;
    }

    setupEventListeners() {
        this.elements.options.forEach(option => {
            option.addEventListener('click', () => this.checkAnswer(option));
        });

        this.elements.hint.addEventListener('click', () => this.useHint());
        this.elements.start.addEventListener('click', () => this.startGame());
        this.elements.restart.addEventListener('click', () => this.startGame());
        
        // Ayarlar
        this.elements.soundToggle.addEventListener('change', (e) => {
            this.soundManager.setEnabled(e.target.checked);
        });
        
        this.elements.volumeSlider.addEventListener('input', (e) => {
            this.soundManager.setVolume(e.target.value);
        });
        
        this.elements.languageSelect.addEventListener('change', (e) => {
            this.languageManager.setLanguage(e.target.value);
        });
        
        this.elements.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            localStorage.setItem('difficulty', this.difficulty);
            this.initializeGameState();
        });
    }

    async loadFlags() {
        try {
            console.log('Bayraklar yükleniyor...');
            this.elements.loading.style.display = 'flex';
            
            const response = await fetch('assets/data/flags.json');
            if (!response.ok) {
                throw new Error(`Bayrak verileri yüklenemedi: ${response.status}`);
            }
            
            this.countries = await response.json();
            console.log(`${this.countries.length} bayrak yüklendi`);
            
            // Zorluk seviyesi olmayan bayraklara varsayılan zorluk seviyesi ata
            this.countries = this.countries.map(country => ({
                ...country,
                difficulty: country.difficulty || 'MEDIUM'
            }));
            
            this.elements.loading.style.display = 'none';
            return true;
        } catch (error) {
            console.error('Bayraklar yüklenirken hata:', error);
            alert(`Bayrak verileri yüklenirken hata oluştu: ${error.message}`);
            this.elements.loading.style.display = 'none';
            return false;
        }
    }

    async startGame() {
        console.log('Oyun başlatılıyor...');
        if (this.countries.length === 0) {
            const loaded = await this.loadFlags();
            if (!loaded) return;
        }

        this.initializeGameState();
        this.isGameActive = true;
        
        this.elements.score.textContent = this.score;
        this.elements.time.textContent = formatTime(this.timeLeft);
        this.elements.hint.textContent = `${this.languageManager.getText('hint')} (${this.hintsLeft})`;
        
        if (this.elements.gameOver) {
            this.elements.gameOver.style.display = 'none';
        }
        
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        this.createNewQuestion();
    }

    updateTimer() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.elements.time.textContent = formatTime(this.timeLeft);
            if (this.timeLeft <= GAME_CONFIG.COUNTDOWN_SOUND_THRESHOLD) {
                this.soundManager.play('tick');
            }
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.isGameActive = false;
        clearInterval(this.timer);
        this.soundManager.play('gameOver');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.elements.highScore.textContent = this.highScore;
        }
        
        this.elements.finalScore.textContent = this.score;
        AnimationManager.fadeIn(this.elements.gameOver);
    }

    createNewQuestion() {
        console.log('Yeni soru oluşturuluyor...');
        const optionsCount = GAME_CONFIG.OPTIONS[this.difficulty];
        
        if (this.countries.length < optionsCount) {
            alert('Yeterli bayrak verisi yok!');
            this.endGame();
            return;
        }

        const selectedCountries = this.getRandomCountries();
        this.currentFlag = selectedCountries[getRandomInt(selectedCountries.length)];
        
        // Bayrak yolunu düzelt
        this.elements.flagImage.src = `public/flags/${this.currentFlag.code}.svg`;
        this.elements.flagImage.alt = `${this.currentFlag.name_tr} bayrağı`;
        
        console.log('Seçilen bayrak:', this.currentFlag);
        
        shuffleArray(selectedCountries);
        this.elements.options.forEach((option, index) => {
            if (index < selectedCountries.length) {
                option.style.display = 'block';
                option.textContent = selectedCountries[index][`name_${this.languageManager.currentLang}`];
                option.classList.remove('correct', 'wrong', 'disabled');
            } else {
                option.style.display = 'none';
            }
        });
    }

    getRandomCountries() {
        // Zorluk seviyesi belirtilmemiş bayraklar için varsayılan zorluk seviyesini kullan
        const filteredCountries = this.countries.filter(country => 
            !country.difficulty || country.difficulty === this.difficulty
        );
        
        console.log(`${filteredCountries.length} bayrak mevcut zorluk seviyesinde (${this.difficulty})`);
        
        if (filteredCountries.length < GAME_CONFIG.OPTIONS[this.difficulty]) {
            // Yeterli bayrak yoksa tüm bayrakları kullan
            console.log('Seçilen zorluk seviyesi için yeterli bayrak yok, tüm bayraklar kullanılıyor');
            return this.getRandomFromArray(this.countries, GAME_CONFIG.OPTIONS[this.difficulty]);
        }

        return this.getRandomFromArray(filteredCountries, GAME_CONFIG.OPTIONS[this.difficulty]);
    }

    getRandomFromArray(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    useHint() {
        if (this.hintsLeft > 0 && this.isGameActive) {
            this.hintsLeft--;
            this.elements.hint.textContent = `${this.languageManager.getText('hint')} (${this.hintsLeft})`;
            this.soundManager.play('hint');
            
            const wrongOptions = Array.from(this.elements.options).filter(
                option => option.textContent !== this.currentFlag[`name_${this.languageManager.currentLang}`]
            );
            
            const removeCount = Math.min(2, wrongOptions.length);
            for (let i = 0; i < removeCount; i++) {
                const randomIndex = getRandomInt(wrongOptions.length);
                wrongOptions[randomIndex].classList.add('disabled');
                wrongOptions.splice(randomIndex, 1);
            }
        }
    }

    checkAnswer(selectedOption) {
        if (!this.isGameActive || selectedOption.classList.contains('disabled')) return;
        
        const selectedCountry = selectedOption.textContent;
        const correctAnswer = this.currentFlag[`name_${this.languageManager.currentLang}`];
        
        if (selectedCountry === correctAnswer) {
            selectedOption.classList.add('correct');
            this.score++;
            this.elements.score.textContent = this.score;
            this.soundManager.play('correct');
        } else {
            selectedOption.classList.add('wrong');
            this.elements.options.forEach(option => {
                if (option.textContent === correctAnswer) {
                    option.classList.add('correct');
                }
            });
            this.soundManager.play('wrong');
        }
        
        this.elements.options.forEach(option => option.classList.add('disabled'));
        setTimeout(() => this.createNewQuestion(), GAME_CONFIG.ANIMATION_DURATION);
    }
}

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, oyun başlatılıyor...');
    window.game = new FlagGame();
}); 