/**
 * 📺 Series Module
 * 
 * Manage series page with:
 * - Display series list
 * - Seasons and episodes
 * - Direct playback
 * - Favorites
 */

class SeriesApp {
    constructor() {
        this.streamingManager = null;
        this.allSeries = [];
        this.filteredSeries = [];
        this.currentCategory = 'all';
        this.favorites = this.loadFavorites();
        this.expandedSeries = {};
        
        this.init();
    }

    /**
     * Initialize
     */
    async init() {
        console.log('Initializing Series...');
        
        try {
            // Initialize streaming manager
            this.streamingManager = new StreamingManager();
            await this.streamingManager.init();
            
            // Get series from IPTV
            this.allSeries = this.streamingManager.getContentByType('series');
            this.filteredSeries = [...this.allSeries];
            
            console.log(`Loaded ${this.allSeries.length} series`);
            
            // If no series available, log available content types for debugging
            if (this.allSeries.length === 0) {
                console.warn('No series found in content. Available movies: ' + this.streamingManager.getContentByType('movies').length);
                console.warn('Available live-tv: ' + this.streamingManager.getContentByType('live-tv').length);
            }
            
            // Render interface
            this.render();
            
        } catch (error) {
            console.error('Error initializing series:', error);
            this.showError('Failed to load series');
        }
    }

    /**
     * عرض الواجهة
     */
    render() {
        this.renderCategories();
        this.renderSeries();
    }

    /**
     * Display categories
     */
    renderCategories() {
        const filterContainer = document.querySelector('.category-filter');
        if (!filterContainer) return;
        
        const categories = this.getUniqueCategories();
        
        let html = `
            <button class="category-btn tv-focus ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
                All (${this.allSeries.length})
            </button>
        `;
        
        categories.forEach(category => {
            const count = this.getSeriesByCategory(category).length;
            html += `
                <button class="category-btn tv-focus ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">
                    ${category} (${count})
                </button>
            `;
        });
        
        filterContainer.innerHTML = html;
    }

    /**
     * Display series
     */
    renderSeries() {
        let seriesContainer = document.querySelector('.series-list-container');
        if (!seriesContainer) {
            const mainContent = document.querySelector('main .content') || document.querySelector('main');
            if (!mainContent) return;
            seriesContainer = document.createElement('div');
            seriesContainer.className = 'series-list-container';
            mainContent.appendChild(seriesContainer);
        }
        
        if (this.filteredSeries.length === 0) {
            seriesContainer.innerHTML = `
                <div class="no-content" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    text-align: center;
                    color: #aaa;
                ">
                    <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">📺</div>
                    <h2 style="margin: 0 0 10px 0; font-size: 24px;">No Series Found</h2>
                    <p style="margin: 0; font-size: 14px; opacity: 0.7;">No series match your current filter</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="series-list">';
        
        this.filteredSeries.forEach((series, index) => {
            const isFavorite = this.isFavorite(series.id);
            const isExpanded = this.expandedSeries[series.id];
            
            html += `
                <div class="series-item tv-focus" data-series-id="${series.id}">
                    <div class="series-poster">
                        <img src="${series.logo || 'https://via.placeholder.com/150x225?text=' + series.name}" 
                             alt="${series.name}"
                             onerror="this.src='https://via.placeholder.com/150x225?text=Series'">
                        <div class="play-overlay">
                            <button class="play-btn" data-series-id="${series.id}">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="series-info">
                        <h3 class="series-title">${series.name}</h3>
                        <p class="series-category">${series.group}</p>
                        <div class="series-controls">
                            <button class="expand-btn" data-series-id="${series.id}">
                                ${isExpanded ? '▼' : '▶'} الحلقات
                            </button>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-series-id="${series.id}">
                                ♡
                            </button>
                        </div>
                    </div>
                    
                    ${isExpanded ? this.renderSeasons(series) : ''}
                </div>
            `;
        });
        
        html += '</div>';
        
        // إنشاء container إذا لم يكن موجوداً
        let seriesContainer = document.querySelector('.series-container');
        if (!seriesContainer) {
            seriesContainer = document.createElement('div');
            seriesContainer.className = 'series-container';
            container.appendChild(seriesContainer);
        }
        
        seriesContainer.innerHTML = html;
        
        this.attachSeriesListeners();
        this.attachPlayButtons();
    }

    /**
     * عرض المواسم والحلقات
     */
    renderSeasons(series) {
        // محاكاة المواسم والحلقات
        const seasons = [
            { season: 1, episodes: 10 },
            { season: 2, episodes: 12 },
            { season: 3, episodes: 8 }
        ];
        
        let html = '<div class="seasons-container">';
        
        seasons.forEach(s => {
            html += `
                <div class="season">
                    <div class="season-title">الموسم ${s.season}</div>
                    <div class="episodes-list">
                        ${Array.from({length: s.episodes}, (_, i) => i + 1).map(ep => `
                            <button class="episode-btn" data-episode="${ep}" data-series-id="${series.id}">
                                ${ep}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    }

    /**
     * إضافة Event Listeners للمسلسلات
     */
    attachSeriesListeners() {
        // فتح/إغلاق المواسم
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.dataset.seriesId;
                this.toggleSeasons(seriesId);
            });
        });
        
        // إضافة للمفضلة
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.dataset.seriesId;
                this.toggleFavorite(seriesId);
            });
        });
    }

    /**
     * إضافة Event Listeners للأزرار
     */
    attachPlayButtons() {
        // تشغيل الحلقة
        document.querySelectorAll('.episode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.dataset.seriesId;
                const episode = btn.dataset.episode;
                const series = this.allSeries.find(s => s.id === seriesId);
                
                if (series) {
                    this.playEpisode(series, episode);
                }
            });
        });
        
        // تشغيل أول حلقة
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.dataset.seriesId;
                const series = this.allSeries.find(s => s.id === seriesId);
                
                if (series) {
                    this.playEpisode(series, 1);
                }
            });
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter by category
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.category-btn').dataset.category;
                this.filterByCategory(category);
            });
        });
        
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }
        
        // Play buttons
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.dataset.seriesId;
                const series = this.allSeries.find(s => s.id === seriesId);
                if (series) {
                    this.playEpisode(series, 1);
                }
            });
        });
        
        // Expand buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const seriesId = btn.closest('[data-series-id]').dataset.seriesId;
                this.toggleSeasons(seriesId);
            });
        });
    }

    /**
     * فتح/إغلاق المواسم
     */
    toggleSeasons(seriesId) {
        this.expandedSeries[seriesId] = !this.expandedSeries[seriesId];
        this.renderSeries();
    }

    /**
     * تصفية حسب الفئة
     */
    filterByCategory(category) {
        this.currentCategory = category;
        
        // تحديث الأزرار النشطة
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        if (category === 'all') {
            this.filteredSeries = [...this.allSeries];
        } else {
            this.filteredSeries = this.getSeriesByCategory(category);
        }
        
        this.renderSeries();
    }

    /**
     * البحث
     */
    search(query) {
        if (!query.trim()) {
            this.filteredSeries = [...this.allSeries];
        } else {
            const search = query.toLowerCase();
            this.filteredSeries = this.allSeries.filter(series =>
                series.name.toLowerCase().includes(search) ||
                series.group.toLowerCase().includes(search)
            );
        }
        
        this.renderSeries();
    }

    /**
     * تشغيل حلقة
     */
    async playEpisode(series, episodeNumber) {
        try {
            console.log(`▶️ تشغيل: ${series.name} - الحلقة ${episodeNumber}`);
            
            // Record as watched
            this.recordWatched(series);
            
            // إغلاق أي player موجود
            this.closePlayer();
            
            // فتح player جديد
            this.openPlayer(series, episodeNumber);
            
            // تشغيل من خلال StreamingManager
            const playUrl = await this.streamingManager.playContent(series);
            
            console.log('✅ بدء التشغيل:', playUrl);
            
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.showError('فشل التشغيل. يرجى المحاولة مرة أخرى.');
        }
    }

    /**
     * تسجيل المسلسل كمشاهد
     */
    recordWatched(series) {
        try {
            const watched = JSON.parse(localStorage.getItem('watched_items') || '[]');
            
            // Remove if already exists
            const filtered = watched.filter(w => w.id !== series.id);
            
            // Add to front
            const item = {
                id: series.id,
                name: series.name,
                logo: series.logo,
                group: series.group,
                type: 'series',
                streamUrl: series.streamUrl,
                timestamp: Date.now(),
                progress: 0
            };
            
            filtered.unshift(item);
            
            // Keep only last 50
            filtered.splice(50);
            
            // Save to localStorage
            localStorage.setItem('watched_items', JSON.stringify(filtered));
            
            console.log('✅ تم تسجيل المشاهدة');
        } catch (error) {
            console.warn('⚠️ خطأ في تسجيل المشاهدة:', error);
        }
    }

    /**
     * فتح Player
     */
    openPlayer(series, episode) {
        const modal = document.createElement('div');
        modal.id = 'player-modal';
        modal.className = 'player-modal';
        modal.innerHTML = `
            <div class="player-content">
                <button class="player-close">✕</button>
                <video id="video-player" controls autoplay style="width: 100%; height: 100%;"></video>
                <div class="player-info">
                    <h2>${series.name}</h2>
                    <p>الحلقة ${episode} - ${series.group}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.injectPlayerStyles();
        
        // إغلاق على الضغط على X
        modal.querySelector('.player-close').addEventListener('click', () => {
            this.closePlayer();
        });
    }

    /**
     * إغلاق Player
     */
    closePlayer() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            const video = modal.querySelector('video');
            if (video) video.pause();
            modal.remove();
        }
    }

    /**
     * إضافة CSS للـ Player
     */
    injectPlayerStyles() {
        if (document.getElementById('player-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'player-styles';
        style.textContent = `
            .player-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999;
            }
            
            .player-content {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .player-close {
                position: absolute;
                top: 20px;
                right: 20px;
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
            
            .player-info {
                position: absolute;
                bottom: 20px;
                left: 20px;
                color: white;
            }
            
            .series-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            
            .series-item {
                background: #1a1a1a;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
            }
            
            .series-poster {
                position: relative;
                width: 100%;
                padding-bottom: 150%;
                overflow: hidden;
            }
            
            .series-poster img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .play-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 200ms ease;
            }
            
            .series-item:hover .play-overlay {
                background: rgba(0, 0, 0, 0.5);
            }
            
            .play-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #3b82f6;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .series-info {
                padding: 12px;
            }
            
            .series-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: white;
            }
            
            .series-category {
                margin: 0 0 8px 0;
                font-size: 12px;
                color: #999;
            }
            
            .series-controls {
                display: flex;
                gap: 8px;
            }
            
            .expand-btn, .favorite-btn {
                flex: 1;
                padding: 6px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid #3b82f6;
                border-radius: 4px;
                color: #3b82f6;
                cursor: pointer;
                font-size: 12px;
            }
            
            .favorite-btn.active {
                background: #3b82f6;
                color: white;
            }
            
            .seasons-container {
                padding: 12px;
                background: #111;
                border-top: 1px solid #333;
            }
            
            .season {
                margin-bottom: 12px;
            }
            
            .season-title {
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .episodes-list {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 4px;
            }
            
            .episode-btn {
                padding: 4px;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .episode-btn:hover {
                background: #3b82f6;
                border-color: #3b82f6;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * إضافة/حذف من المفضلة
     */
    toggleFavorite(seriesId) {
        const index = this.favorites.indexOf(seriesId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(seriesId);
        }
        
        this.saveFavorites();
        this.renderSeries();
    }

    /**
     * هل المسلسل مفضل
     */
    isFavorite(seriesId) {
        return this.favorites.includes(seriesId);
    }

    /**
     * حفظ المفضلة
     */
    saveFavorites() {
        localStorage.setItem('series_favorites', JSON.stringify(this.favorites));
    }

    /**
     * تحميل المفضلة
     */
    loadFavorites() {
        const saved = localStorage.getItem('series_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * الحصول على الفئات الفريدة
     */
    getUniqueCategories() {
        return [...new Set(this.allSeries.map(s => s.group))].sort();
    }

    /**
     * الحصول على المسلسلات حسب الفئة
     */
    getSeriesByCategory(category) {
        return this.allSeries.filter(s => s.group === category);
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.textContent = `❌ ${message}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10001;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.seriesApp = new SeriesApp();
});
