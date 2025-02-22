// Oyun ayarları
export const GAME_CONFIG = {
    DURATIONS: {
        EASY: 45,
        MEDIUM: 30,
        HARD: 20
    },
    OPTIONS: {
        EASY: 2,
        MEDIUM: 4,
        HARD: 6
    },
    HINTS: {
        EASY: 3,
        MEDIUM: 3,
        HARD: 2
    },
    COUNTDOWN_SOUND_THRESHOLD: 5,
    ANIMATION_DURATION: 300,
    CORRECT_SCORE: 1
};

// Ses ayarları
export const SOUND_CONFIG = {
    ENABLED: true,
    VOLUME: 0.7,
    EFFECTS: {
        correct: 'public/sounds/correct.mp3',
        wrong: 'public/sounds/wrong.mp3',
        gameOver: 'public/sounds/game-over.mp3',
        hint: 'public/sounds/hint.mp3',
        tick: 'public/sounds/tick.mp3'
    }
};

// Dil ayarları
export const LANGUAGE_CONFIG = {
    DEFAULT: 'tr',
    SUPPORTED: ['tr', 'en'],
    TRANSLATIONS: {
        tr: {
            title: 'Bayrak Bilmece Oyunu',
            start: 'Oyunu Başlat',
            score: 'Skor',
            time: 'Süre',
            hint: 'İpucu',
            gameOver: 'Oyun Bitti',
            highScore: 'En Yüksek Skor',
            restart: 'Tekrar Oyna',
            loading: 'Yükleniyor...',
            error: 'Hata oluştu!',
            settings: 'Ayarlar',
            sound: 'Ses',
            language: 'Dil',
            difficulty: 'Zorluk',
            easy: 'Kolay',
            medium: 'Orta',
            hard: 'Zor'
        },
        en: {
            title: 'Flag Quiz Game',
            start: 'Start Game',
            score: 'Score',
            time: 'Time',
            hint: 'Hint',
            gameOver: 'Game Over',
            highScore: 'High Score',
            restart: 'Play Again',
            loading: 'Loading...',
            error: 'Error occurred!',
            settings: 'Settings',
            sound: 'Sound',
            language: 'Language',
            difficulty: 'Difficulty',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard'
        }
    }
};

// Admin panel ayarları
export const ADMIN_CONFIG = {
    PASSWORD_HASH: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password'
    SESSION_DURATION: 3600000, // 1 saat
    MAX_FILE_SIZE: 5242880, // 5MB
    ALLOWED_FILE_TYPES: ['image/svg+xml', 'text/csv']
}; 