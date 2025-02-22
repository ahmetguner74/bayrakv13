// Dil yönetimi
export class LanguageManager {
    constructor(config) {
        this.config = config;
        this.currentLang = localStorage.getItem('language') || config.DEFAULT;
    }

    setLanguage(lang) {
        if (this.config.SUPPORTED.includes(lang)) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateUI();
        }
    }

    getText(key) {
        return this.config.TRANSLATIONS[this.currentLang][key] || key;
    }

    updateUI() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.getText(key);
        });
    }
}

// Ses yönetimi
export class SoundManager {
    constructor(config) {
        this.config = config;
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || config.VOLUME;
        this.loadSounds();
    }

    loadSounds() {
        Object.entries(this.config.EFFECTS).forEach(([name, path]) => {
            const audio = new Audio(path);
            audio.volume = this.volume;
            this.sounds[name] = audio;
        });
    }

    play(soundName) {
        if (this.enabled && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(err => 
                console.log(`Ses çalma hatası (${soundName}):`, err)
            );
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    setVolume(volume) {
        this.volume = volume;
        localStorage.setItem('soundVolume', volume);
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
}

// Animasyon yönetimi
export class AnimationManager {
    static fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.max(1 - (progress / duration), 0);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Admin panel yardımcıları
export class AdminUtils {
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static validateSession() {
        const session = localStorage.getItem('adminSession');
        if (!session) return false;
        
        const { timestamp, hash } = JSON.parse(session);
        const now = Date.now();
        
        return (now - timestamp) < ADMIN_CONFIG.SESSION_DURATION;
    }

    static setSession(hash) {
        localStorage.setItem('adminSession', JSON.stringify({
            timestamp: Date.now(),
            hash
        }));
    }

    static clearSession() {
        localStorage.removeItem('adminSession');
    }
}

// Genel yardımcı fonksiyonlar
export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 