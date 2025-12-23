/**
 * Mobile Dashboard Manager
 * Handles all interactive functionality for mobile dashboard
 */

class MobileDashboardManager {
    constructor() {
        this.init();
        this.detectDevice();
    }

    init() {
        this.setupEventListeners();
        this.handleNavigation();
        this.setupTouchHandling();
        this.preventPullToRefresh();
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
