/**
 * 🎬 تطبيق IPTV Player
 * 
 * يقوم بـ:
 * 1. جلب توكن Stream
 * 2. تحميل ملف M3U
 * 3. تحليل M3U وتقسيم المحتوى
 * 4. عرض القنوات والأفلام والمسلسلات
 */

class IPTVPlayer {
    constructor() {
        this.playlistUrl = null;
        this.channels = [];
        this.categories = {};
        this.currentChannel = null;
        this.isLoading = false;
        
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('🎬 بدء تهيئة IPTV Player...');
        
        try {
            // 1️⃣ الحصول على توكن Stream
            await this.getStreamToken();
            
            // 2️⃣ جلب ملف M3U
            await this.loadPlaylist();
            
            // 3️⃣ تحليل M3U
            this.parseM3U();
            
            // 4️⃣ عرض الواجهة
            this.renderUI();
            
            console.log('✅ تم تهيئة IPTV Player بنجاح');
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('فشل تحميل التطبيق. يرجى التحقق من الاشتراك.');
        }
    }

    /**
     * الخطوة 1: الحصول على توكن Stream
     */
    async getStreamToken() {
        try {
            const response = await fetch('/api/stream/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'فشل الحصول على التوكن');
            }

            this.playlistUrl = data.playlist_url;
            console.log('✅ تم الحصول على توكن Stream:', data.playlist_url);
            
            return data;
        } catch (error) {
            console.error('❌ خطأ في الحصول على التوكن:', error);
            throw error;
        }
    }

    /**
     * الخطوة 2: جلب ملف M3U
     */
    async loadPlaylist() {
        if (!this.playlistUrl) {
            throw new Error('لا يوجد رابط Playlist');
        }

        try {
            console.log('📥 جاري تحميل ملف M3U من:', this.playlistUrl);
            
            const response = await fetch(this.playlistUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.m3uContent = await response.text();
            console.log(`✅ تم تحميل M3U (${this.m3uContent.length} حرف)`);
            
            return this.m3uContent;
        } catch (error) {
            console.error('❌ خطأ في تحميل M3U:', error);
            throw error;
        }
    }

    /**
     * الخطوة 3: تحليل ملف M3U
     * 
     * تنسيق M3U:
     * #EXTINF:-1 tvg-id="..." tvg-logo="..." group-title="Sports",Channel Name
     * http://stream-url
     */
    parseM3U() {
        console.log('🔍 جاري تحليل ملف M3U...');
        
        const lines = this.m3uContent.split('\n');
        let currentInfo = null;

        this.channels = [];
        this.categories = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // تخطي السطور الفارغة والتعليقات غير المهمة
            if (!line) continue;
            if (line === '#EXTM3U') continue;

            // قراءة معلومات القناة
            if (line.startsWith('#EXTINF')) {
                currentInfo = this.parseEXTINF(line);
            }
            // قراءة رابط البث
            else if (currentInfo && line.startsWith('http')) {
                const channel = {
                    ...currentInfo,
                    url: line
                };

                // تصنيف المحتوى حسب group-title
                this.categorizeChannel(channel);
                
                this.channels.push(channel);
            }
        }

        console.log(`✅ تم تحليل ${this.channels.length} قناة من ${Object.keys(this.categories).length} فئة`);
        console.log('📁 الفئات:', this.categories);
    }

    /**
     * استخراج معلومات القناة من سطر EXTINF
     */
    parseEXTINF(extinf) {
        const info = {
            id: '',
            name: '',
            logo: '',
            group: 'Uncategorized',
            type: 'unknown'
        };

        // استخراج tvg-id
        const idMatch = extinf.match(/tvg-id="([^"]*)"/);
        if (idMatch) info.id = idMatch[1];

        // استخراج tvg-logo
        const logoMatch = extinf.match(/tvg-logo="([^"]*)"/);
        if (logoMatch) info.logo = logoMatch[1];

        // استخراج group-title
        const groupMatch = extinf.match(/group-title="([^"]+)"/);
        if (groupMatch) {
            info.group = groupMatch[1];
        }

        // استخراج اسم القناة (آخر جزء بعد الفاصلة)
        const nameMatch = extinf.match(/,(.+)$/);
        if (nameMatch) {
            info.name = nameMatch[1].trim();
        }

        return info;
    }

    /**
     * تصنيف القنوات حسب النوع والفئة
     * 
     * Live TV: Sports, News, Entertainment, Movies, Arabic, etc.
     * Movies: Movies, VOD, Cinema
     * Series: Series, TV Shows, Drama
     */
    categorizeChannel(channel) {
        const group = channel.group.toLowerCase();

        // تحديد نوع المحتوى
        if (this.isLiveTV(group)) {
            channel.type = 'live-tv';
        } else if (this.isMovies(group)) {
            channel.type = 'movies';
        } else if (this.isSeries(group)) {
            channel.type = 'series';
        }

        // إضافة للفئات
        if (!this.categories[channel.group]) {
            this.categories[channel.group] = [];
        }
        this.categories[channel.group].push(channel);
    }

    isLiveTV(group) {
        const liveKeywords = ['sports', 'news', 'live', 'entertainment', 'arabic', 'عربي', 'قنوات'];
        return liveKeywords.some(keyword => group.includes(keyword));
    }

    isMovies(group) {
        const movieKeywords = ['movies', 'vod', 'cinema', 'film', 'أفلام'];
        return movieKeywords.some(keyword => group.includes(keyword));
    }

    isSeries(group) {
        const seriesKeywords = ['series', 'tv shows', 'drama', 'مسلسلات', 'drama'];
        return seriesKeywords.some(keyword => group.includes(keyword));
    }

    /**
     * الخطوة 4: عرض الواجهة
     */
    renderUI() {
        console.log('🎨 جاري عرض الواجهة...');

        // إنشاء الهيكل الأساسي
        const container = document.getElementById('iptv-container') || this.createContainer();

        // إضافة فئات البث
        this.renderCategories(container);

        // إضافة مشغل الفيديو
        this.renderPlayer(container);

        console.log('✅ تم عرض الواجهة بنجاح');
    }

    /**
     * إنشاء حاوية IPTV الرئيسية
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'iptv-container';
        container.className = 'iptv-player-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * عرض فئات المحتوى
     */
    renderCategories(container) {
        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'iptv-categories';

        const categoryButtons = document.createElement('div');
        categoryButtons.className = 'category-buttons';

        // زر "الكل"
        const allBtn = document.createElement('button');
        allBtn.textContent = '📺 الكل';
        allBtn.className = 'category-btn active';
        allBtn.addEventListener('click', () => this.showAllChannels());
        categoryButtons.appendChild(allBtn);

        // أزرار الفئات
        Object.keys(this.categories).forEach(category => {
            const btn = document.createElement('button');
            btn.textContent = `${category} (${this.categories[category].length})`;
            btn.className = 'category-btn';
            btn.addEventListener('click', () => this.showCategory(category));
            categoryButtons.appendChild(btn);
        });

        categoriesDiv.appendChild(categoryButtons);

        // قائمة القنوات
        const channelsList = document.createElement('div');
        channelsList.className = 'channels-list';
        channelsList.id = 'channels-list';
        categoriesDiv.appendChild(channelsList);

        container.appendChild(categoriesDiv);

        // عرض جميع القنوات في البداية
        this.showAllChannels();
    }

    /**
     * عرض جميع القنوات
     */
    showAllChannels() {
        const list = document.getElementById('channels-list');
        list.innerHTML = '';

        this.channels.forEach(channel => {
            list.appendChild(this.createChannelItem(channel));
        });

        // تحديث الأزرار
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.category-btn')[0].classList.add('active');
    }

    /**
     * عرض فئة محددة
     */
    showCategory(category) {
        const list = document.getElementById('channels-list');
        list.innerHTML = '';

        this.categories[category].forEach(channel => {
            list.appendChild(this.createChannelItem(channel));
        });

        // تحديث الأزرار
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(category)) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * إنشاء عنصر قناة
     */
    createChannelItem(channel) {
        const item = document.createElement('div');
        item.className = `channel-item type-${channel.type}`;
        
        const logo = channel.logo ? `<img src="${channel.logo}" alt="${channel.name}" class="channel-logo">` : '';
        
        item.innerHTML = `
            ${logo}
            <div class="channel-info">
                <div class="channel-name">${channel.name}</div>
                <div class="channel-group">${channel.group}</div>
            </div>
            <div class="channel-type">${this.getTypeLabel(channel.type)}</div>
        `;

        item.addEventListener('click', () => this.playChannel(channel));
        
        return item;
    }

    /**
     * تشغيل قناة
     */
    playChannel(channel) {
        console.log('▶️ تشغيل:', channel.name);
        this.currentChannel = channel;

        const video = document.getElementById('iptv-video');
        if (video && video.src !== channel.url) {
            video.src = channel.url;
            video.play().catch(err => console.error('خطأ في التشغيل:', err));
        }

        // تحديث البيانات الحالية
        const nowPlayingDiv = document.getElementById('now-playing');
        if (nowPlayingDiv) {
            nowPlayingDiv.innerHTML = `
                <div class="now-playing-title">${channel.name}</div>
                <div class="now-playing-group">${channel.group}</div>
            `;
        }
    }

    /**
     * عرض مشغل الفيديو
     */
    renderPlayer(container) {
        const player = document.createElement('div');
        player.className = 'iptv-player';

        player.innerHTML = `
            <video id="iptv-video" class="video-player" controls>
                متصفحك لا يدعم تشغيل الفيديو
            </video>
            <div id="now-playing" class="now-playing">
                <div class="now-playing-title">اختر قناة للبدء</div>
            </div>
        `;

        container.appendChild(player);

        // تشغيل أول قناة تلقائياً
        if (this.channels.length > 0) {
            this.playChannel(this.channels[0]);
        }
    }

    /**
     * الحصول على تسمية نوع المحتوى
     */
    getTypeLabel(type) {
        const labels = {
            'live-tv': '📺 بث مباشر',
            'movies': '🎬 فيلم',
            'series': '📺 مسلسل',
            'unknown': '❓ أخرى'
        };
        return labels[type] || labels.unknown;
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const container = document.getElementById('iptv-container') || document.body;
        const error = document.createElement('div');
        error.className = 'iptv-error';
        error.textContent = `❌ ${message}`;
        container.appendChild(error);
    }
}

/**
 * 🎨 CSS Styles
 */
const styles = `
.iptv-player-container {
    display: flex;
    height: 100vh;
    background: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', sans-serif;
}

.iptv-categories {
    width: 25%;
    background: #1e293b;
    border-right: 1px solid #334155;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.category-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    overflow-y: auto;
    border-bottom: 1px solid #334155;
}

.category-btn {
    padding: 0.75rem;
    background: #334155;
    border: 1px solid #475569;
    border-radius: 0.5rem;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
}

.category-btn:hover {
    background: #475569;
    color: white;
}

.category-btn.active {
    background: #3b82f6;
    border-color: #2563eb;
    color: white;
}

.channels-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
}

.channel-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid #334155;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 150ms ease;
}

.channel-item:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
}

.channel-logo {
    width: 40px;
    height: 40px;
    border-radius: 0.25rem;
    object-fit: contain;
}

.channel-info {
    flex: 1;
    min-width: 0;
}

.channel-name {
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
}

.channel-group {
    font-size: 11px;
    color: #94a3b8;
}

.channel-type {
    font-size: 11px;
    padding: 0.25rem 0.5rem;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 0.25rem;
    color: #93c5fd;
}

.iptv-player {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #000;
    position: relative;
}

.video-player {
    width: 100%;
    height: 100%;
    background: #000;
}

.now-playing {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    background: rgba(0, 0, 0, 0.8);
    padding: 1rem;
    border-radius: 0.5rem;
    min-width: 250px;
}

.now-playing-title {
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
}

.now-playing-group {
    font-size: 12px;
    color: #94a3b8;
}

.iptv-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #0f172a;
    color: #ef4444;
    font-size: 18px;
    font-weight: 600;
}

@media (max-width: 768px) {
    .iptv-player-container {
        flex-direction: column;
    }

    .iptv-categories {
        width: 100%;
        height: auto;
        max-height: 30vh;
        border-right: none;
        border-bottom: 1px solid #334155;
    }

    .iptv-player {
        height: 70vh;
    }
}
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new IPTVPlayer();
});
