/**
 * Mobile Dashboard Manager
 * Handles all interactive functionality for mobile dashboard
 */

class MobileDashboardManager {
    constructor() {
        this.streamingManager = null;
        this.watchedItems = JSON.parse(localStorage.getItem('watched_items') || '[]');
        this.favoriteItems = JSON.parse(localStorage.getItem('favorite_items') || '[]');
        this.currentSection = 'movies'; // Default section
        
        this.initAsync();
    }

    async initAsync() {
        await this.init();
        this.detectDevice();
    }

    async init() {
        try {
            // Initialize streaming manager
            this.streamingManager = new StreamingManager();
            await this.streamingManager.init();

            // Display username and time
            this.displayUsername();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);

            // Setup listeners
            this.setupEventListeners();
            this.handleNavigation();
            this.setupTouchHandling();
            this.preventPullToRefresh();

            // Load initial content (Movies)
            this.loadSectionContent('movies');

            console.log('✅ تم تهيئة لوحة التحكم بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة لوحة التحكم:', error);
        }
    }

    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const ua = navigator.userAgent;
        this.device = {
            isIOS: /iPad|iPhone|iPod/.test(ua),
            isAndroid: /Android/.test(ua),
            isTablet: /iPad|Android(?!.*Mobile)/.test(ua),
            isMobile: /mobile|android|iphone|ipad|ipod|blackberry|windows phone|kindle|opera mini|playstation|tablet|webos|tizen/i.test(ua),
            userAgent: ua
        };
        
        console.log('🔍 Device detected:', {
            iOS: this.device.isIOS,
            Android: this.device.isAndroid,
            Tablet: this.device.isTablet,
            Mobile: this.device.isMobile
        });
        
        // Store device info for future use
        sessionStorage.setItem('deviceInfo', JSON.stringify(this.device));
    }

    /**
     * Setup all event listeners for the dashboard
     */
    setupEventListeners() {
        // Quick access buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAccess(e));
            btn.addEventListener('touchstart', (e) => this.addTouchFeedback(e));
            btn.addEventListener('touchend', (e) => this.removeTouchFeedback(e));
        });

        // Grid items
        document.querySelectorAll('.grid-item-mobile').forEach(item => {
            item.addEventListener('click', (e) => this.handleGridItemClick(e));
        });

        // Carousel items
        document.querySelectorAll('.carousel-item-mobile').forEach(item => {
            item.addEventListener('click', (e) => this.handleCarouselItemClick(e));
        });

        // Featured card
        document.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleFeaturedClick(e));
        });
    }

    /**
     * Load content for a section
     */
    async loadSectionContent(section) {
        console.log(`📂 جاري تحميل قسم: ${section}`);
        this.currentSection = section;

        if (!this.streamingManager) {
            console.error('Streaming manager not initialized');
            return;
        }

        // Get content by type
        const contentList = this.streamingManager.getContentByType(section);
        
        // Get watched items for this section
        const watchedForSection = this.watchedItems.filter(item => 
            section === 'playlists' ? item.type === 'playlists' : item.type === section
        );
        
        // Get favorites for this section
        const favoritesForSection = this.favoriteItems.filter(item => 
            section === 'playlists' ? item.type === 'playlists' : item.type === section
        );

        // Sort watched by timestamp (newest first)
        watchedForSection.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Render sections
        this.renderContinueWatching(watchedForSection);
        this.renderFavorites(favoritesForSection);
    }

    /**
     * Render continue watching section
     */
    renderContinueWatching(watched) {
        const carousel = document.querySelector('.carousel-mobile');
        if (!carousel) return;
        
        carousel.innerHTML = '';

        if (watched.length === 0) {
            carousel.innerHTML = '<div class="empty-state">No content watched</div>';
            return;
        }

        // Show only last 5
        watched.slice(0, 5).forEach(item => {
            const itemEl = document.createElement('button');
            itemEl.className = 'carousel-item-mobile';
            const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23222' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23888' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;
            itemEl.innerHTML = `
                <div class="item-img-container">
                    <img src="${item.logo || placeholderSvg}" 
                         alt="${item.name}" class="item-img" loading="lazy">
                    <div class="play-overlay">
                        <svg class="play-icon-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                        </svg>
                    </div>
                    <div class="progress-bar-mobile">
                        <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
                    </div>
                </div>
                <div class="item-info">
                    <div class="item-title">${item.name || 'Unknown'}</div>
                    <div class="item-duration">${Math.floor((item.duration || 0) / 60)} mins</div>
                </div>
            `;

            // Add image error handler
            const img = itemEl.querySelector('.item-img');
            if (img && item.logo) {
                img.addEventListener('error', function onImageError() {
                    if (this.src !== placeholderSvg) {
                        this.src = placeholderSvg;
                        this.style.backgroundColor = '#222';
                    }
                }, { once: false });
            }

            itemEl.addEventListener('click', () => {
                this.playContent(item);
            });

            carousel.appendChild(itemEl);
        });
    }

    /**
     * Render favorites section
     */
    renderFavorites(favorites) {
        const grid = document.querySelector('.grid-mobile');
        if (!grid) return;
        
        grid.innerHTML = '';

        if (favorites.length === 0) {
            grid.innerHTML = '<div class="empty-state">No items were added to the favorites.</div>';
            return;
        }

        // Show only first 6
        favorites.slice(0, 6).forEach(item => {
            const itemEl = document.createElement('button');
            itemEl.className = 'grid-item-mobile';
            const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect fill='%23222' width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23888' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;
            itemEl.innerHTML = `
                <div class="grid-img-container">
                    <img src="${item.logo || placeholderSvg}" 
                         alt="${item.name}" class="grid-img" loading="lazy">
                    <div class="grid-badge">⭐</div>
                </div>
                <div class="grid-info">
                    <div class="grid-title">${item.name || 'Unknown'}</div>
                    <div class="grid-meta">${item.group || 'Movies'}</div>
                </div>
            `;

            // Add image error handler
            const img = itemEl.querySelector('.grid-img');
            if (img && item.logo) {
                img.addEventListener('error', function onImageError() {
                    if (this.src !== placeholderSvg) {
                        this.src = placeholderSvg;
                        this.style.backgroundColor = '#222';
                    }
                }, { once: false });
            }

            itemEl.addEventListener('click', () => {
                this.playContent(item);
            });

            grid.appendChild(itemEl);
        });
    }

    /**
     * Play content and record it as watched
     */
    playContent(item) {
        console.log('▶️ تشغيل:', item.name);
        
        // Open player in a modal
        this.openPlayer(item);
    }

    /**
     * Open player modal with resume capability
     */
    openPlayer(item) {
        const modal = document.createElement('div');
        modal.id = 'mobile-player-modal';
        modal.className = 'mobile-player-modal';
        
        // Get saved playback position
        const startTime = item.currentTime || 0;
        const resumeMessage = startTime > 0 ? `⏱️ استئناف من الدقيقة ${Math.floor(startTime / 60)}:${String(Math.floor(startTime % 60)).padStart(2, '0')}` : '';
        
        modal.innerHTML = `
            <div class="player-content">
                <button class="player-close" type="button">✕</button>
                ${resumeMessage ? `<div class="resume-notification">${resumeMessage}</div>` : ''}
                <video id="mobile-video-player" controls autoplay playsinline style="width: 100%; height: 100%; object-fit: contain;">
                    <source src="${item.streamUrl}" type="application/x-mpegURL">
                    Your browser does not support the video tag.
                </video>
                <div class="player-info">
                    <h2>${item.name}</h2>
                    <p>${item.group || 'Content'}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.injectPlayerStyles();
        
        // Set playback position after video loads
        const video = document.getElementById('mobile-video-player');
        if (startTime > 0) {
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = startTime;
                console.log('⏪ استئناف التشغيل من:', startTime, 'ثانية');
            }, { once: true });
        }
        
        // Save playback position periodically
        const saveInterval = setInterval(() => {
            if (!document.getElementById('mobile-player-modal')) {
                clearInterval(saveInterval);
                return;
            }
            this.updateWatchedTime(item, video.currentTime, video.duration);
        }, 5000);
        
        // Close button
        modal.querySelector('.player-close').addEventListener('click', () => {
            clearInterval(saveInterval);
            this.recordWatchedFinal(item, video.currentTime, video.duration);
            this.closePlayer();
        });
        
        // Close on Escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                clearInterval(saveInterval);
                this.recordWatchedFinal(item, video.currentTime, video.duration);
                this.closePlayer();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    /**
     * Close player modal
     */
    closePlayer() {
        const modal = document.getElementById('mobile-player-modal');
        if (modal) {
            const video = modal.querySelector('video');
            if (video) video.pause();
            modal.remove();
        }
    }

    /**
     * Update watched time without reloading
     */
    updateWatchedTime(item, currentTime, duration) {
        try {
            const watched = JSON.parse(localStorage.getItem('watched_items') || '[]');
            const watchedItem = watched.find(w => w.id === item.id);
            
            if (watchedItem) {
                watchedItem.currentTime = currentTime;
                watchedItem.duration = duration;
                watchedItem.progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
                watchedItem.timestamp = Date.now();
                
                localStorage.setItem('watched_items', JSON.stringify(watched));
            }
        } catch (error) {
            console.warn('Error updating watched time:', error);
        }
    }

    /**
     * Record final watched state
     */
    recordWatchedFinal(item, currentTime, duration) {
        try {
            const watched = JSON.parse(localStorage.getItem('watched_items') || '[]');
            const watchedItem = watched.find(w => w.id === item.id);
            
            if (watchedItem) {
                watchedItem.currentTime = currentTime;
                watchedItem.duration = duration;
                watchedItem.progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
                watchedItem.timestamp = Date.now();
                
                localStorage.setItem('watched_items', JSON.stringify(watched));
                console.log('Saved playback position at:', Math.floor(currentTime), 'seconds');
            } else {
                // Create new watched entry
                const newWatched = {
                    id: item.id,
                    name: item.name,
                    logo: item.logo,
                    group: item.group,
                    type: item.type,
                    streamUrl: item.streamUrl,
                    currentTime: currentTime,
                    duration: duration,
                    progress: duration > 0 ? Math.round((currentTime / duration) * 100) : 0,
                    timestamp: Date.now()
                };
                watched.push(newWatched);
                localStorage.setItem('watched_items', JSON.stringify(watched));
            }
            this.loadSectionContent(this.currentSection);
        } catch (error) {
            console.warn('Error recording watched item:', error);
        }
    }

    /**
     * Inject player styles
     */
    injectPlayerStyles() {
        if (document.getElementById('mobile-player-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-player-styles';
        style.textContent = `
            .mobile-player-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .player-content {
                position: relative;
                width: 100%;
                height: 100%;
                background: #000;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .player-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.7);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                border-radius: 50%;
                z-index: 10000;
            }
            
            .resume-notification {
                position: absolute;
                top: 60px;
                left: 20px;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 10001;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .player-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
                padding: 20px;
                color: white;
            }
            
            .player-info h2 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .player-info p {
                margin: 0;
                opacity: 0.7;
                font-size: 14px;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Add to favorites
     */
    addToFavorites(item) {
        const favorite = {
            id: item.id,
            name: item.name,
            logo: item.logo,
            group: item.group,
            type: item.type,
            streamUrl: item.streamUrl,
            addedAt: Date.now()
        };

        // Check if already exists
        if (this.favoriteItems.find(f => f.id === item.id)) {
            return;
        }

        this.favoriteItems.push(favorite);
        localStorage.setItem('favorite_items', JSON.stringify(this.favoriteItems));

        this.loadSectionContent(this.currentSection);
    }

    /**
     * Remove from favorites
     */
    removeFromFavorites(itemId) {
        this.favoriteItems = this.favoriteItems.filter(f => f.id !== itemId);
        localStorage.setItem('favorite_items', JSON.stringify(this.favoriteItems));

        this.loadSectionContent(this.currentSection);
    }

    /**
     * Display username
     */
    displayUsername() {
        const username = sessionStorage.getItem('username') || 'Guest';
        const userDisplay = document.getElementById('username-display');
        if (userDisplay) {
            userDisplay.textContent = username;
        }
    }

    /**
     * Update clock
     */
    updateClock() {
        const now = new Date();
        
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeString = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        
        const timeDisplay = document.getElementById('time-display');
        const dateDisplay = document.getElementById('date-display');
        
        if (timeDisplay) timeDisplay.textContent = timeString;
        if (dateDisplay) dateDisplay.textContent = dateString;
    }

    /**
     * Handle quick access button navigation
     */
    handleQuickAccess(event) {
        const button = event.currentTarget;
        const action = button.getAttribute('data-action');
        
        console.log('✨ Quick access clicked:', action);
        
        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);

        // Navigate based on action
        switch(action) {
            case 'live-tv':
                window.location.href = '/live-tv';
                break;
            case 'movies':
                window.location.href = '/movies';
                break;
            case 'series':
                window.location.href = '/series';
                break;
            case 'playlists':
                window.location.href = '/my-list';
                break;
        }
    }
    /**
     * Handle bottom navigation
     */
    handleNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                const nav = item.getAttribute('data-nav');
                console.log('🧭 Navigation:', nav);
                
                // Navigation logic
                switch(nav) {
                    case 'home':
                        // Already on home
                        break;
                    case 'search':
                        window.location.href = '/search';
                        break;
                    case 'downloads':
                        window.location.href = '/downloads';
                        break;
                    case 'profile':
                        window.location.href = '/profile';
                        break;
                }
            });
        });
    }

    /**
     * Handle touch feedback
     */
    addTouchFeedback(event) {
        const target = event.currentTarget;
        target.style.opacity = '0.7';
    }

    removeTouchFeedback(event) {
        const target = event.currentTarget;
        target.style.opacity = '1';
    }

    /**
     * Setup touch handling for better mobile experience
     */
    setupTouchHandling() {
        let touchStartX = 0;
        let touchEndX = 0;

        const mainContent = document.querySelector('.mobile-main');
        
        if (mainContent) {
            mainContent.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);

            mainContent.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, false);
        }
    }

    /**
     * Handle swipe gestures
     */
    handleSwipe(startX, endX) {
        const diff = startX - endX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swiped left
                console.log('👈 Swiped left');
            } else {
                // Swiped right
                console.log('👉 Swiped right');
            }
        }
    }

    /**
     * Prevent pull-to-refresh on iOS
     */
    preventPullToRefresh() {
        document.body.addEventListener('touchmove', (e) => {
            // Allow scrolling on specific elements
            const scrollableElements = ['.mobile-main', '.carousel-mobile'];
            let isScrollable = false;

            scrollableElements.forEach(selector => {
                if (e.target.closest(selector)) {
                    isScrollable = true;
                }
            });

            // Prevent default only if not on scrollable element
            if (!isScrollable && e.target.closest('.mobile-main')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Handle grid item click
     */
    handleGridItemClick(event) {
        const item = event.currentTarget;
        const title = item.querySelector('.grid-title').textContent;
        console.log('📺 Grid item clicked:', title);
        
        // Navigate to item details
        // window.location.href = `/watch/${title}`;
    }

    /**
     * Handle carousel item click
     */
    handleCarouselItemClick(event) {
        const item = event.currentTarget;
        const title = item.querySelector('.item-title').textContent;
        console.log('▶️  Carousel item clicked:', title);
        
        // Play the video
        // window.location.href = `/watch/${title}`;
    }

    /**
     * Handle featured card click
     */
    handleFeaturedClick(event) {
        const card = event.currentTarget;
        const title = card.querySelector('.featured-title').textContent;
        console.log('⭐ Featured card clicked:', title);
        
        // Navigate to featured content
        // window.location.href = `/watch/${title}`;
    }

    /**
     * Update user info on page
     */
    static updateUserInfo(username) {
        const displayElement = document.getElementById('username-display');
        if (displayElement) {
            displayElement.textContent = username;
            sessionStorage.setItem('username', username);
        }
    }

    /**
     * Show notification
     */
    static showNotification(message, duration = 3000, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const bgColor = type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.95)';
        const borderColor = type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 16px;
            right: 16px;
            background: ${bgColor};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            text-align: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            border: 1px solid ${borderColor};
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    /**
     * Log analytics event
     */
    static logEvent(eventName, eventData = {}) {
        console.log(`📊 Event: ${eventName}`, eventData);
        // Send to analytics service if available
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileDashboardManager();
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        console.log('📱 Orientation changed to:', window.orientation);
        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(`📐 New dimensions: ${width}x${height}`);
    }, 100);
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 App hidden');
    } else {
        console.log('👀 App visible');
    }
});

// Handle online/offline
window.addEventListener('online', () => {
    console.log('🟢 Back online');
    MobileDashboardManager.showNotification('الاتصال بالإنترنت مستعاد', 2000);
});

window.addEventListener('offline', () => {
    console.log('🔴 Offline');
    MobileDashboardManager.showNotification('فقد الاتصال بالإنترنت', 3000, 'error');
});
