/**
 * Settings Page - Interactive Features
 * Handles settings management, language selection, and playback preferences
 */

class SettingsManager {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.playlistInput = document.getElementById('playlistUrl');
        this.savePlaylistBtn = document.getElementById('savePlaylistBtn');
        this.languageButtons = document.querySelectorAll('.language-btn');
        this.qualityButtons = document.querySelectorAll('.quality-btn');
        this.toggles = {
            autoplay: document.getElementById('autoplay'),
            rememberPosition: document.getElementById('rememberPosition')
        };
        this.currentLanguage = 'en';
        this.currentQuality = 'auto';
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupNavigation();
        this.setupPlaylistHandling();
        this.setupLanguageSelection();
        this.setupQualitySelection();
        this.setupToggles();
        this.setupKeyboardNavigation();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.currentLanguage = settings.language || 'en';
            this.currentQuality = settings.quality || 'auto';
            
            if (this.playlistInput) {
                this.playlistInput.value = settings.playlistUrl || '';
            }
            
            if (this.toggles.autoplay) {
                this.toggles.autoplay.checked = settings.autoplay !== false;
            }
            
            if (this.toggles.rememberPosition) {
                this.toggles.rememberPosition.checked = settings.rememberPosition !== false;
            }
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = {
            language: this.currentLanguage,
            quality: this.currentQuality,
            playlistUrl: this.playlistInput?.value || '',
            autoplay: this.toggles.autoplay?.checked || false,
            rememberPosition: this.toggles.rememberPosition?.checked || false
        };
        localStorage.setItem('appSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully');
    }

    /**
     * Setup navigation buttons
     */
    setupNavigation() {
        this.navButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                this.handleNavClick(e, index);
            });
        });
    }

    /**
     * Handle navigation button clicks
     */
    handleNavClick(event, index) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        console.log(`Navigation clicked: ${event.currentTarget.title}`);
    }

    /**
     * Setup playlist URL handling
     */
    setupPlaylistHandling() {
        if (this.savePlaylistBtn) {
            this.savePlaylistBtn.addEventListener('click', () => {
                this.handleSavePlaylist();
            });
        }

        if (this.playlistInput) {
            this.playlistInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSavePlaylist();
                }
            });
        }
    }

    /**
     * Handle save playlist action
     */
    handleSavePlaylist() {
        const url = this.playlistInput?.value;
        
        if (!url) {
            this.showNotification('Please enter a playlist URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        console.log('Saving playlist:', url);
        this.saveSettings();
        this.animateButton(this.savePlaylistBtn);
    }

    /**
     * Validate URL format
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Setup language selection
     */
    setupLanguageSelection() {
        this.languageButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.handleLanguageChange(e);
            });
        });
    }

    /**
     * Handle language change
     */
    handleLanguageChange(event) {
        const lang = event.currentTarget.dataset.lang;
        this.languageButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        this.currentLanguage = lang;
        this.saveSettings();
        this.applyLanguage(lang);
    }

    /**
     * Apply language to interface
     */
    applyLanguage(lang) {
        console.log(`Language changed to: ${lang}`);
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }

    /**
     * Setup video quality selection
     */
    setupQualitySelection() {
        this.qualityButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                this.handleQualityChange(e);
            });
        });
    }

    /**
     * Handle quality change
     */
    handleQualityChange(event) {
        const quality = event.currentTarget.dataset.quality;
        this.qualityButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        this.currentQuality = quality;
        this.saveSettings();
        console.log(`Video quality changed to: ${quality}`);
    }

    /**
     * Setup toggle switches
     */
    setupToggles() {
        Object.values(this.toggles).forEach((toggle) => {
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    /**
     * Handle keyboard press
     */
    handleKeyPress(event) {
        const focusableElements = document.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
        const activeElement = document.activeElement;
        const currentIndex = Array.from(focusableElements).indexOf(activeElement);

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.focusElement(currentIndex - 1, focusableElements);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.focusElement(currentIndex + 1, focusableElements);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.focusElement(currentIndex - 1, focusableElements);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.focusElement(currentIndex + 1, focusableElements);
                break;
            case 'Enter':
                if (activeElement && activeElement.tagName === 'BUTTON') {
                    event.preventDefault();
                    activeElement.click();
                }
                break;
        }
    }

    /**
     * Focus an element by index
     */
    focusElement(index, elements) {
        if (index >= 0 && index < elements.length) {
            elements[index].focus();
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'success') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${type === 'error' ? '#dc2626' : '#22c55e'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Animate button click
     */
    animateButton(button) {
        if (!button) return;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Get current settings
     */
    getSettings() {
        return {
            language: this.currentLanguage,
            quality: this.currentQuality,
            playlistUrl: this.playlistInput?.value || '',
            autoplay: this.toggles.autoplay?.checked || false,
            rememberPosition: this.toggles.rememberPosition?.checked || false
        };
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        if (newSettings.language) {
            this.currentLanguage = newSettings.language;
            this.applyLanguage(newSettings.language);
        }

        if (newSettings.quality) {
            this.currentQuality = newSettings.quality;
        }

        if (newSettings.playlistUrl && this.playlistInput) {
            this.playlistInput.value = newSettings.playlistUrl;
        }

        this.saveSettings();
    }
}

/**
 * Add animation styles dynamically
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize settings manager when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    window.settingsManager = new SettingsManager();
    console.log('Settings page initialized');
});

/**
 * Handle logout
 */
function handleLogout() {
    console.log('Logging out...');
    // window.location.href = '/logout';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SettingsManager,
        handleLogout
    };
}
