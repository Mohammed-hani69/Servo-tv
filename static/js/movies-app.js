/**
 * 🎬 Movies Module
 * 
 * إدارة صفحة الأفلام مع:
 * - عرض Grid من الأفلام
 * - تصفية حسب الفئة
 * - البحث السريع
 * - إضافة للمفضلة
 * - التشغيل المباشر
 */

class MoviesApp {
    constructor() {
        this.streamingManager = null;
        this.allMovies = [];
        this.filteredMovies = [];
        this.currentCategory = 'all';
        this.favorites = this.loadFavorites();
        
        this.init();
    }

    /**
     * التهيئة
     */
    async init() {
        console.log('🎬 بدء تهيئة Movies...');
        
        try {
            // تهيئة مدير البث
            this.streamingManager = new StreamingManager();
            await this.streamingManager.init();
            
            // جلب الأفلام من IPTV
            this.allMovies = this.streamingManager.getContentByType('movies');
            this.filteredMovies = [...this.allMovies];
            
            console.log(`✅ تم تحميل ${this.allMovies.length} فيلم`);
            
            // عرض الواجهة
            this.render();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('فشل تحميل الأفلام');
        }
    }

    /**
     * عرض الواجهة
     */
    render() {
        this.renderCategories();
        this.renderMovies();
    }

    /**
     * عرض الفئات
     */
    renderCategories() {
        const filterContainer = document.querySelector('.category-filter');
        if (!filterContainer) return;
        
        const categories = this.getUniqueCategories();
        
        let html = `
            <button class="category-btn tv-focus ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
                الكل (${this.allMovies.length})
            </button>
        `;
        
        categories.forEach(category => {
            const count = this.getMoviesByCategory(category).length;
            html += `
                <button class="category-btn tv-focus ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">
                    ${category} (${count})
                </button>
            `;
        });
        
        filterContainer.innerHTML = html;
    }

    /**
     * عرض الأفلام
     */
    renderMovies() {
        const grid = document.getElementById('moviesGrid');
        if (!grid) {
            console.warn('⚠️ عنصر #moviesGrid غير موجود');
            return;
        }
        
        if (this.filteredMovies.length === 0) {
            grid.innerHTML = '<div class="no-content">لا توجد أفلام</div>';
            return;
        }
        
        let html = '';
        
        this.filteredMovies.forEach((movie, index) => {
            const isFavorite = this.isFavorite(movie.id);
            // استخدام صورة عالية الجودة - من logo أو placeholder
            const imageUrl = movie.logo && movie.logo.trim() 
                ? movie.logo 
                : `https://picsum.photos/300/450?random=${index + Math.random() * 1000}`;
            
            const placeholderUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450'%3E%3Crect fill='%23234' width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' font-size='18' font-weight='bold' fill='%23fff' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(movie.name.substring(0, 15))}'%3E%3C/text%3E%3C/svg%3E`;
            
            html += `
                <div class="movie-card tv-focus" data-movie-id="${movie.id}" data-index="${index}" data-stream-url="${movie.streamUrl || ''}">
                    <div class="movie-poster">
                        <img src="${imageUrl}" 
                             alt="${movie.name}"
                             loading="lazy"
                             onerror="this.src='${placeholderUrl}'">
                        <div class="play-overlay">
                            <button class="play-btn" type="button" data-index="${index}">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="movie-quality">HD</div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.name}</h3>
                        <div class="movie-meta">
                            <span class="movie-category">${movie.group}</span>
                            <span class="movie-rating">⭐ 8.5</span>
                        </div>
                    </div>
                    <button class="movie-favorite ${isFavorite ? 'active' : ''}" data-movie-id="${movie.id}" type="button">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                        </svg>
                    </button>
                </div>
            `;
        });
        
        grid.innerHTML = html;
        this.attachMovieListeners();
    }

    /**
     * إضافة Event Listeners للأفلام
     */
    attachMovieListeners() {
        // تشغيل الفيلم عند الضغط على الكارد أو زر التشغيل
        document.querySelectorAll('.movie-card').forEach(card => {
            // الضغط على الكارد كاملة
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.movie-favorite')) {
                    const index = parseInt(card.dataset.index);
                    this.playMovie(this.filteredMovies[index]);
                }
            });
        });
        
        // الضغط على زر التشغيل
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.movie-card');
                if (card) {
                    const index = parseInt(card.dataset.index);
                    this.playMovie(this.filteredMovies[index]);
                }
            });
        });
        
        // إضافة للمفضلة
        document.querySelectorAll('.movie-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = btn.dataset.movieId;
                this.toggleFavorite(movieId);
            });
        });
    }

    /**
     * إعداد Event Listeners
     */
    setupEventListeners() {
        // تصفية حسب الفئة
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
        
        // البحث
        const moviesSearchInput = document.getElementById('searchInput');
        if (moviesSearchInput) {
            moviesSearchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }
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
            this.filteredMovies = [...this.allMovies];
        } else {
            this.filteredMovies = this.getMoviesByCategory(category);
        }
        
        this.renderMovies();
    }

    /**
     * البحث
     */
    search(query) {
        if (!query.trim()) {
            this.filteredMovies = [...this.allMovies];
        } else {
            const search = query.toLowerCase();
            this.filteredMovies = this.allMovies.filter(movie =>
                movie.name.toLowerCase().includes(search) ||
                movie.group.toLowerCase().includes(search)
            );
        }
        
        this.renderMovies();
    }

    /**
     * تشغيل الفيلم
     */
    async playMovie(movie) {
        try {
            console.log('▶️ تشغيل الفيلم:', movie.name);
            
            if (!movie.streamUrl) {
                throw new Error('لا توجد رابط تشغيل للفيلم');
            }
            
            // إغلاق أي player موجود
            this.closePlayer();
            
            // فتح player جديد مع التشغيل المباشر
            this.openPlayer(movie);
            
            console.log('✅ بدء التشغيل:', movie.streamUrl);
            
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.showError(`فشل التشغيل: ${error.message}`);
            this.closePlayer();
        }
    }

    /**
     * فتح Player
     */
    openPlayer(movie) {
        const modal = document.createElement('div');
        modal.id = 'player-modal';
        modal.className = 'player-modal';
        
        modal.innerHTML = `
            <div class="player-content">
                <button class="player-close" type="button">✕</button>
                <video id="video-player" controls autoplay playsinline style="width: 100%; height: 100%; object-fit: contain;">
                    <source src="${movie.streamUrl}" type="application/x-mpegURL">
                    Your browser does not support the video tag.
                </video>
                <div class="player-info">
                    <h2>${movie.name}</h2>
                    <p>${movie.group}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة CSS
        this.injectPlayerStyles();
        
        // إغلاق على الضغط على X
        modal.querySelector('.player-close').addEventListener('click', () => {
            this.closePlayer();
        });
        
        // إغلاق عند الضغط على Escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                this.closePlayer();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
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
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .player-content {
                position: relative;
                width: 90%;
                height: 90%;
                background: #000;
                border-radius: 8px;
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
            
            .movie-poster-large {
                display: none;
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
            }
            
            .player-info p {
                margin: 0;
                opacity: 0.7;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * إضافة/حذف من المفضلة
     */
    toggleFavorite(movieId) {
        const index = this.favorites.indexOf(movieId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(movieId);
        }
        
        this.saveFavorites();
        
        // تحديث الـ UI
        document.querySelectorAll(`[data-movie-id="${movieId}"]`).forEach(el => {
            el.querySelector('.movie-favorite')?.classList.toggle('active');
        });
    }

    /**
     * هل الفيلم مفضل
     */
    isFavorite(movieId) {
        return this.favorites.includes(movieId);
    }

    /**
     * حفظ المفضلة
     */
    saveFavorites() {
        localStorage.setItem('movies_favorites', JSON.stringify(this.favorites));
    }

    /**
     * تحميل المفضلة
     */
    loadFavorites() {
        const saved = localStorage.getItem('movies_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * الحصول على الفئات الفريدة
     */
    getUniqueCategories() {
        return [...new Set(this.allMovies.map(m => m.group))].sort();
    }

    /**
     * الحصول على الأفلام حسب الفئة
     */
    getMoviesByCategory(category) {
        return this.allMovies.filter(m => m.group === category);
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
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
    window.moviesApp = new MoviesApp();
});
