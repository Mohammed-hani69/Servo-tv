/**
 * Mobile Settings Page - Interactive Features
 * Handles settings management for mobile devices
 */

class MobileSettingsManager {
    constructor() {
        this.playlistInput = document.getElementById('playlistUrl');
        this.savePlaylistBtn = document.getElementById('savePlaylistBtn');
        this.languageButtons = document.querySelectorAll('.language-btn');
        this.qualityButtons = document.querySelectorAll('.quality-btn');
        this.deviceIdElement = document.getElementById('deviceId');
        
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
        this.loadSettingsFromBackend();
        this.setupPlaylistHandling();
        this.setupLanguageSelection();
        this.setupQualitySelection();
        this.setupToggles();
    }

    /**
     * Load settings from backend API
     */
    async loadSettingsFromBackend() {
        try {
            const response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                // Update device ID display
                if (this.deviceIdElement) {
                    this.deviceIdElement.textContent = data.data.device_id || 'Unknown';
                }

                // Update media link if available
                if (data.data.media_link && this.playlistInput) {
                    this.playlistInput.value = data.data.media_link;
                }
            }
        } catch (error) {
            console.error('Error loading settings from backend:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            try {
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
            } catch (error) {
                console.error('Error loading settings from localStorage:', error);
            }
        }
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
    async handleSavePlaylist() {
        const url = this.playlistInput?.value;
        
        if (!url) {
            this.showNotification('Please enter a playlist URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        try {
            this.savePlaylistBtn.disabled = true;
            const response = await fetch('/api/settings/playlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playlistUrl: url })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Playlist saved successfully', 'success');
            } else {
                this.showNotification(data.message || 'Failed to save playlist', 'error');
            }
        } catch (error) {
            console.error('Error saving playlist:', error);
            this.showNotification('Connection error', 'error');
        } finally {
            this.savePlaylistBtn.disabled = false;
        }
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
    async handleLanguageChange(event) {
        const lang = event.currentTarget.dataset.lang;
        this.languageButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        this.currentLanguage = lang;

        try {
            const response = await fetch('/api/settings/language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ language: lang })
            });

            const data = await response.json();

            if (data.success) {
                this.applyLanguage(lang);
                this.showNotification('Language updated', 'success');
            } else {
                this.showNotification(data.message || 'Failed to update language', 'error');
            }
        } catch (error) {
            console.error('Error saving language:', error);
            this.applyLanguage(lang);
        }
    }

    /**
     * Apply language to interface
     */
    applyLanguage(lang) {
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
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
    async handleQualityChange(event) {
        const quality = event.currentTarget.dataset.quality;
        this.qualityButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        this.currentQuality = quality;

        try {
            const response = await fetch('/api/settings/quality', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quality: quality })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(`Quality set to ${quality}`, 'success');
            } else {
                this.showNotification(data.message || 'Failed to update quality', 'error');
            }
        } catch (error) {
            console.error('Error saving quality:', error);
            this.showNotification('Connection error', 'error');
        }
    }

    /**
     * Setup toggle switches
     */
    setupToggles() {
        Object.keys(this.toggles).forEach((key) => {
            const toggle = this.toggles[key];
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.savePlaybackSettings();
                });
            }
        });
    }

    /**
     * Save playback settings to backend
     */
    async savePlaybackSettings() {
        try {
            const response = await fetch('/api/settings/playback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    autoplay: this.toggles.autoplay?.checked || false,
                    rememberPosition: this.toggles.rememberPosition?.checked || false
                })
            });

            const data = await response.json();

            if (data.success) {
                const settings = {
                    language: this.currentLanguage,
                    quality: this.currentQuality,
                    playlistUrl: this.playlistInput?.value || '',
                    autoplay: this.toggles.autoplay?.checked || false,
                    rememberPosition: this.toggles.rememberPosition?.checked || false
                };
                localStorage.setItem('appSettings', JSON.stringify(settings));
            }
        } catch (error) {
            console.error('Error saving playback settings:', error);
        }
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 10px;
            right: 10px;
            background-color: ${type === 'error' ? '#dc2626' : '#22c55e'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

/**
 * Add animation styles dynamically
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes slideDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100px);
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
    window.mobileSettingsManager = new MobileSettingsManager();
    console.log('Mobile settings page initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileSettingsManager;
}
