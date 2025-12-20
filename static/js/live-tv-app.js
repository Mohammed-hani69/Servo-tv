/**
 * 📺 Live TV Module
 * 
 * إدارة صفحة Live TV مع:
 * - جلب البث من IPTV
 * - تصفية حسب الفئة والدولة
 * - تشغيل مباشر
 */

class LiveTVApp {
    constructor() {
        this.streamingManager = null;
        this.allChannels = [];
        this.filteredChannels = [];
        this.currentCategory = 'all';
        this.currentCountry = 'all';
        this.favorites = this.loadFavorites();
        
        this.init();
    }

    /**
     * التهيئة
     */
    async init() {
        console.log('📺 بدء تهيئة Live TV...');
        
        try {
            // تهيئة مدير البث
            this.streamingManager = new StreamingManager();
            await this.streamingManager.init();
            
            // جلب البيانات
            this.allChannels = this.streamingManager.getContentByType('live-tv');
            this.filteredChannels = [...this.allChannels];
            
            console.log(`✅ تم تحميل ${this.allChannels.length} قناة`);
            
            // عرض الواجهة
            this.render();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('فشل تحميل Live TV');
        }
    }

    /**
     * عرض الواجهة
     */
    render() {
        // تحديث قائمة الفئات
        this.renderCategories();
        
        // تحديث قائمة القنوات
        this.renderChannels();
    }

    /**
     * عرض الفئات
     */
    renderCategories() {
        const categoriesList = document.querySelector('.categories-list');
        if (!categoriesList) {
            console.warn('⚠️ عنصر .categories-list غير موجود');
            return;
        }
        
        const categories = this.getUniqueCategories();
        
        // إضافة زر "الكل"
        let html = `
            <button class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
                <span>الكل</span>
            </button>
        `;
        
        // إضافة الفئات
        categories.forEach(category => {
            html += `
                <button class="category-item ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">
                    <span>${category}</span>
                    <span class="count">(${this.getChannelsByCategory(category).length})</span>
                </button>
            `;
        });
        
        categoriesList.innerHTML = html;
    }

    /**
     * عرض القنوات
     */
    renderChannels() {
        const channelsGrid = document.querySelector('.channels-grid');
        if (!channelsGrid) {
            console.warn('⚠️ عنصر .channels-grid غير موجود');
            return;
        }
        
        if (this.filteredChannels.length === 0) {
            channelsGrid.innerHTML = '<div class="no-content">لا توجد قنوات</div>';
            return;
        }
        
        let html = '';
        
        this.filteredChannels.forEach((channel, index) => {
            const isFavorite = this.isFavorite(channel.id);
            const logoUrl = channel.logo || `https://via.placeholder.com/100?text=${encodeURIComponent(channel.name)}`;
            
            html += `
                <div class="channel-card" data-channel-id="${channel.id}" data-index="${index}">
                    <div class="channel-thumbnail">
                        <img src="${logoUrl}" 
                             alt="${channel.name}"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3EChannel%3C/text%3E%3C/svg%3E'">
                        <div class="play-button">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="channel-info">
                        <h3 class="channel-name">${channel.name}</h3>
                        <div class="channel-meta">
                            <span class="channel-quality">HD</span>
                            <span class="channel-category">${channel.group}</span>
                        </div>
                    </div>
                    <button class="channel-favorite ${isFavorite ? 'active' : ''}" data-channel-id="${channel.id}">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                        </svg>
                    </button>
                </div>
            `;
        });
        
        channelsGrid.innerHTML = html;
        
        // إضافة Event Listeners للقنوات
        this.attachChannelListeners();
    }

    /**
     * إضافة Event Listeners للقنوات
     */
    attachChannelListeners() {
        // تشغيل القناة
        document.querySelectorAll('.channel-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.channel-favorite')) {
                    const index = parseInt(card.dataset.index);
                    this.playChannel(this.filteredChannels[index]);
                }
            });
        });
        
        // إضافة للمفضلة
        document.querySelectorAll('.channel-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const channelId = btn.dataset.channelId;
                this.toggleFavorite(channelId);
            });
        });
    }

    /**
     * إعداد Event Listeners
     */
    setupEventListeners() {
        // تصفية حسب الفئة
        document.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.category-item')?.dataset.category;
                if (category) {
                    this.filterByCategory(category);
                }
            });
        });
        
        // البحث
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }
    }

    /**
     * تصفية حسب الفئة
     */
    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredChannels = [...this.allChannels];
        } else if (category === 'favorites') {
            this.filteredChannels = this.allChannels.filter(ch => this.isFavorite(ch.id));
        } else {
            this.filteredChannels = this.getChannelsByCategory(category);
        }
        
        this.render();
    }

    /**
     * البحث
     */
    search(query) {
        if (!query.trim()) {
            this.filteredChannels = [...this.allChannels];
        } else {
            const search = query.toLowerCase();
            this.filteredChannels = this.allChannels.filter(ch =>
                ch.name.toLowerCase().includes(search) ||
                ch.group.toLowerCase().includes(search)
            );
        }
        
        this.renderChannels();
    }

    /**
     * تشغيل القناة
     */
    async playChannel(channel) {
        try {
            console.log('▶️ تشغيل:', channel.name);
            
            // إغلاق أي player موجود
            this.closePlayer();
            
            // فتح player جديد
            this.openPlayer(channel);
            
            // تشغيل من خلال StreamingManager
            const playUrl = await this.streamingManager.playContent(channel);
            
            console.log('✅ بدء التشغيل:', playUrl);
            
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.showError('فشل التشغيل. يرجى المحاولة مرة أخرى.');
        }
    }

    /**
     * فتح Player
     */
    openPlayer(channel) {
        // إنشاء player modal
        const modal = document.createElement('div');
        modal.id = 'player-modal';
        modal.className = 'player-modal';
        modal.innerHTML = `
            <div class="player-content">
                <button class="player-close" onclick="document.getElementById('player-modal').remove()">✕</button>
                <div class="player-header">
                    <h2>${channel.name}</h2>
                    <p>${channel.group}</p>
                </div>
                <video id="video-player" controls autoplay style="width: 100%; height: 100%; background: #000;"></video>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // CSS للـ modal
        this.injectPlayerStyles();
    }

    /**
     * إغلاق Player
     */
    closePlayer() {
        const modal = document.getElementById('player-modal');
        if (modal) modal.remove();
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
                transition: background 150ms ease;
            }
            
            .player-close:hover {
                background: rgba(0, 0, 0, 0.9);
            }
            
            .player-header {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
                padding: 20px;
                color: white;
                z-index: 1;
            }
            
            .player-header h2 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }
            
            .player-header p {
                margin: 0;
                font-size: 14px;
                opacity: 0.7;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * إضافة/حذف من المفضلة
     */
    toggleFavorite(channelId) {
        const channel = this.allChannels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        const index = this.favorites.indexOf(channelId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(channelId);
        }
        
        this.saveFavorites();
        
        // تحديث الـ UI
        document.querySelectorAll(`[data-channel-id="${channelId}"]`).forEach(el => {
            el.classList.toggle('active');
        });
    }

    /**
     * هل القناة مفضلة
     */
    isFavorite(channelId) {
        return this.favorites.includes(channelId);
    }

    /**
     * حفظ المفضلة
     */
    saveFavorites() {
        localStorage.setItem('livetv_favorites', JSON.stringify(this.favorites));
    }

    /**
     * تحميل المفضلة
     */
    loadFavorites() {
        const saved = localStorage.getItem('livetv_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * الحصول على الفئات الفريدة
     */
    getUniqueCategories() {
        return [...new Set(this.allChannels.map(ch => ch.group))];
    }

    /**
     * الحصول على القنوات حسب الفئة
     */
    getChannelsByCategory(category) {
        return this.allChannels.filter(ch => ch.group === category);
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
            animation: slideIn 300ms ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.liveTVApp = new LiveTVApp();
});
