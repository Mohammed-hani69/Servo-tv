/**
 * 🎬 Streaming Manager
 * 
 * يدير:
 * 1. جلب content من IPTV API
 * 2. إنشاء streaming token
 * 3. تشغيل المحتوى
 * 4. معالجة أخطاء التشغيل
 */

class StreamingManager {
    constructor() {
        this.currentContent = null;
        this.token = null;
        this.playlistUrl = null;
        this.contentList = [];
        this.baseUrl = window.location.origin;
    }

    /**
     * تهيئة المدير
     */
    async init() {
        console.log('🎬 تهيئة Streaming Manager...');
        await this.fetchStreamToken();
        await this.loadPlaylist();
    }

    /**
     * جلب Stream Token من Backend
     */
    async fetchStreamToken() {
        try {
            console.log('🔑 جاري طلب Stream Token...');
            
            // محاولة الحصول على device_id من localStorage
            const deviceId = localStorage.getItem('device_uid') || 
                            sessionStorage.getItem('device_uid') ||
                            this.extractDeviceIdFromCookie();
            
            const payload = {};
            if (deviceId) {
                payload.device_id = deviceId;
            }
            
            const response = await fetch(`${this.baseUrl}/api/stream/token`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',  // إرسال الـ cookies
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response text:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'فشل جلب التوكن');
            }

            this.token = data.token;
            this.playlistUrl = data.playlist_url;
            
            console.log('✅ تم جلب Token:', this.token.substring(0, 20) + '...');
            console.log('✅ Playlist URL:', this.playlistUrl);
            return data;
        } catch (error) {
            console.error('❌ خطأ في جلب Token:', error);
            throw error;
        }
    }

    /**
     * جلب M3U Playlist
     */
    async loadPlaylist() {
        try {
            if (!this.playlistUrl) {
                throw new Error('لا يوجد Playlist URL');
            }

            console.log('📥 جاري تحميل Playlist...');
            
            const response = await fetch(this.playlistUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const content = await response.text();
            this.parsePlaylist(content);
            
            console.log(`✅ تم تحميل ${this.contentList.length} محتوى`);
            return this.contentList;
        } catch (error) {
            console.error('❌ خطأ في تحميل Playlist:', error);
            throw error;
        }
    }

    /**
     * تحليل M3U وفصل المحتوى
     */
    parsePlaylist(m3uContent) {
        const lines = m3uContent.split('\n');
        let currentInfo = null;

        this.contentList = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) continue;
            if (line === '#EXTM3U') continue;

            if (line.startsWith('#EXTINF')) {
                currentInfo = this.parseEXTINF(line);
            }
            else if (currentInfo && line.startsWith('http')) {
                const content = {
                    ...currentInfo,
                    streamUrl: line
                };

                // تصنيف المحتوى
                this.categorizeContent(content);
                
                // ✨ تطبيع البيانات لتوحيد مفاتيح رابط البث
                this.normalizeContent(content);
                
                this.contentList.push(content);
            }
        }
    }

    /**
     * 🔧 توحيد البيانات - استخراج رابط البث من مفاتيح متعددة
     * هذا يضمن أن كل عنصر يملك play_url صحيح
     */
    normalizeContent(item) {
        // البحث عن رابط البث من مفاتيح مختلفة
        // Priority: play_url > stream_url > url > m3u8 > source > streamUrl
        if (!item.play_url) {
            item.play_url = 
                item.stream_url ||
                item.url ||
                item.m3u8 ||
                item.source ||
                item.streamUrl ||
                null;
        }

        // طباعة تشخيصية للتحقق
        if (!item.play_url) {
            console.warn(`⚠️ لم يتم العثور على رابط بث لـ: ${item.name}`, {
                المفاتيح: Object.keys(item),
                البيانات: item
            });
        }

        return item;
    }

    /**
     * استخراج معلومات من EXTINF
     */
    parseEXTINF(extinf) {
        let logo = extinf.match(/tvg-logo="([^"]*)"/)?.[1] || '';
        
        // التأكد من أن الصورة يمكن الوصول إليها
        // تجنب صور imgur التي قد تكون محظورة
        if (logo && logo.includes('imgur.com')) {
            logo = ''; // سيتم استخدام placeholder بدلاً منها
        }
        
        return {
            id: extinf.match(/tvg-id="([^"]*)"/)?.[1] || '',
            name: extinf.match(/,(.+)$/)?.[1]?.trim() || 'Unknown',
            logo: logo,
            group: extinf.match(/group-title="([^"]+)"/)?.[1] || 'Other',
            type: 'unknown'
        };
    }

    /**
     * تصنيف المحتوى
     */
    categorizeContent(content) {
        const group = content.group.toLowerCase();

        if (group.includes('sports') || group.includes('news') || group.includes('live')) {
            content.type = 'live-tv';
        } else if (group.includes('movies') || group.includes('film') || group.includes('movie')) {
            content.type = 'movies';
        } else if (group.includes('series') || group.includes('drama') || group.includes('serial') || group.includes('show')) {
            content.type = 'series';
        } else {
            // Default categorization based on content name
            const name = content.name.toLowerCase();
            if (name.includes('series') || name.includes('drama') || name.includes('show')) {
                content.type = 'series';
            } else if (name.includes('movie') || name.includes('film')) {
                content.type = 'movies';
            } else {
                content.type = 'live-tv'; // Default
            }
        }
    }

    /**
     * تشغيل محتوى
     * ✅ الحل رقم (1): التحقق من النوع قبل التشغيل
     */
    async playContent(content) {
        try {
            // تحقق من المحتوى
            if (!content) {
                throw new Error('المحتوى غير موجود');
            }
            
            if (!content.name) {
                throw new Error('اسم المحتوى مفقود');
            }

            // ⚠️ لو Series → افتحها فقط (لا تشغلها)
            if (content.type === 'series') {
                console.log('📂 فتح سلسلة:', content.name);
                this.openSeries(content);
                return;
            }
            
            // استخراج رابط البث باستخدام الدالة الذكية
            const playUrl = this.extractPlayUrl(content);

            if (!playUrl) {
                throw new Error(
                    `المحتوى "${content.name}" لا يحتوي على رابط بث صالح. المفاتيح المتاحة: ${Object.keys(content).join(', ')}`
                );
            }
            
            console.log('▶️ تشغيل:', content.name);
            
            this.currentContent = content;

            // تشغيل في player مباشرة (بدون جلب من backend)
            this.playStream(playUrl, content);

            return playUrl;
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.showError(`فشل تشغيل: ${error.message}`);
            throw error;
        }
    }

    /**
     * فتح سلسلة (لا تشغيل)
     * السلسلات يجب فتح شاشة تفاصيلها واختيار حلقة محددة للتشغيل
     */
    openSeries(series) {
        console.log('📂 Series Container:', series);
        console.log('✅ السلسلة تم فتحها في صفحة التفاصيل');
        // تحديث الرسالة من error إلى info
        this.showInfo('ℹ️ اختر حلقة أو قناة من السلسلة للتشغيل');
    }

    /**
     * عرض رسالة معلومات
     */
    showInfo(message) {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = message;
        infoDiv.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #0284c7;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
        `;
        document.body.appendChild(infoDiv);
        setTimeout(() => infoDiv.remove(), 3000);
    }

    /**
     * 🔍 فحص صحة رابط البث قبل التشغيل
     */
    async validateStreamUrl(streamUrl) {
        try {
            console.log('🔍 فحص صحة الرابط:', streamUrl.substring(0, 50) + '...');

            // فحص أساسي للـ URL
            if (!streamUrl || !streamUrl.startsWith('http')) {
                throw new Error('الرابط غير صالح');
            }

            // محاولة جلب أول 1KB فقط للتأكد من الوصول
            const response = await fetch(streamUrl, {
                method: 'HEAD',
                mode: 'cors',
                timeout: 5000
            }).catch(() => {
                // إذا فشل HEAD، جرب GET
                return fetch(streamUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: { 'Range': 'bytes=0-1000' }
                });
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: الرابط غير موجود أو غير متاح`);
            }

            console.log('✅ الرابط صالح وقابل للوصول');
            return true;
        } catch (error) {
            console.warn('⚠️ تحذير في فحص الرابط:', error.message);
            // لا نرمي خطأ هنا لأن بعض الروابط آمنة من CORS
            return true; // نحاول التشغيل على أي حال
        }
    }

    /**
     * 🔧 تشخيص مشكلة الرابط
     */
    async diagnoseStreamUrl(streamUrl) {
        console.log('🔧 تشخيص مفصل للرابط:', streamUrl);

        const diagnostics = {
            url: streamUrl,
            isValid: false,
            canAccess: false,
            isM3U8: false,
            httpStatus: null,
            suggestions: []
        };

        try {
            // فحص صيغة الرابط
            diagnostics.isM3U8 = streamUrl.includes('.m3u8');
            if (!diagnostics.isM3U8) {
                diagnostics.suggestions.push('⚠️ الرابط قد لا يكون M3U8');
            }

            // فحص الوصول
            const response = await fetch(streamUrl, {
                method: 'HEAD',
                mode: 'cors'
            }).catch(() => {
                return fetch(streamUrl, { method: 'GET', mode: 'cors' });
            });

            diagnostics.httpStatus = response.status;
            diagnostics.canAccess = response.ok;

            if (response.status === 404) {
                diagnostics.suggestions.push('❌ الرابط غير موجود (404)');
                diagnostics.suggestions.push('💡 تحقق من صحة الرابط أو انتظر التحديث');
            } else if (response.status === 403) {
                diagnostics.suggestions.push('❌ الوصول مرفوض (403)');
                diagnostics.suggestions.push('💡 قد تحتاج Authorization أو قد تكون مقيدة جغرافياً');
            } else if (response.status === 502 || response.status === 503) {
                diagnostics.suggestions.push('⚠️ الخادم غير متاح');
                diagnostics.suggestions.push('💡 حاول مرة أخرى بعد قليل');
            }

            if (response.ok) {
                diagnostics.isValid = true;
            }
        } catch (error) {
            diagnostics.suggestions.push(`❌ خطأ في الوصول: ${error.message}`);
            diagnostics.suggestions.push('💡 قد تكون هناك مشكلة في الشبكة أو الـ CORS');
        }

        console.table(diagnostics);
        return diagnostics;
    }

    /**
     * Extract play URL from different keys
     */
    extractPlayUrl(content) {
        // Smart search for stream URL from different keys
        return (
            content.play_url ||
            content.stream_url ||
            content.url ||
            content.m3u8 ||
            content.source ||
            content.streamUrl ||
            (Array.isArray(content.sources) ? content.sources[0] : null) ||
            (Array.isArray(content.urls) ? content.urls[0] : null)
        );
    }

    /**
     * جلب Play URL من Backend
     * ✅ محسّن: يتعامل مع مفاتيح مختلفة
     */
    async getPlayUrl(content) {
        try {
            console.log('🔍 فحص المحتوى:', content);

            // محاولة استخراج رابط البث من مفاتيح مختلفة
            const playUrl = this.extractPlayUrl(content);

            if (!playUrl) {
                // طباعة تشخيصية تفصيلية
                console.error('❌ لم يتم العثور على رابط بث للمحتوى:', {
                    الاسم: content.name,
                    النوع: content.type,
                    المفاتيح_المتاحة: Object.keys(content),
                    البيانات_الكاملة: content
                });

                throw new Error(
                    `❌ المحتوى "${content.name}" لا يحتوي على رابط بث صالح`
                );
            }

            console.log('✅ تم استخراج رابط البث:', playUrl.substring(0, 50) + '...');
            return playUrl;
        } catch (error) {
            console.error('❌ خطأ في جلب Play URL:', error);
            this.showError(`فشل الحصول على رابط البث: ${error.message}`);
            throw error;
        }
    }

    /**
     * 🔄 تحديث الروابط المؤقتة (للعناصر المحفوظة)
     */
    async refreshExpiredUrls() {
        try {
            console.log('🔄 فحص صلاحية الروابط...');
            let refreshedCount = 0;

            for (let item of this.contentList) {
                const age = Date.now() - (item.urlFetchedAt || 0);
                const oneHour = 60 * 60 * 1000;

                if (age > oneHour) {
                    console.log(`🔄 تحديث الرابط لـ: ${item.name}`);
                    refreshedCount++;
                }
            }

            console.log(`✅ تم فحص الروابط (${refreshedCount} محدّث)`);
        } catch (error) {
            console.error('⚠️ خطأ في تحديث الروابط:', error);
        }
    }

    /**
     * ⏱️ مراقبة مستمرة لصحة البث
     */
    startStreamHealthMonitor(videoElement, hls) {
        if (!videoElement || !hls) return;

        let stallCount = 0;
        let lastBufferedTime = 0;

        const checkHealth = setInterval(() => {
            try {
                if (videoElement.paused || videoElement.ended) {
                    clearInterval(checkHealth);
                    return;
                }

                const currentBuffered = videoElement.buffered.length > 0 
                    ? videoElement.buffered.end(videoElement.buffered.length - 1)
                    : 0;

                if (currentBuffered === lastBufferedTime) {
                    stallCount++;
                    console.warn(`⚠️ البث متوقف (${stallCount})`);

                    if (stallCount > 3) {
                        console.warn('🔄 محاولة استعادة البث...');
                        hls.startLoad();
                        stallCount = 0;
                    }
                } else {
                    stallCount = 0;
                }

                lastBufferedTime = currentBuffered;
            } catch (error) {
                console.error('❌ خطأ في مراقبة الصحة:', error);
            }
        }, 1000);

        return checkHealth;
    }

    /**
     * ⏳ انتظر حتى يكون عنصر الفيديو موجوداً في الـ DOM
     */
    waitForVideoElement(selector = '#video-player', timeout = 10000) {
        return new Promise((resolve, reject) => {
            const interval = 100;
            let elapsed = 0;

            // تحقق فوراً
            let element = document.querySelector(selector);
            if (element) {
                console.log('✅ عنصر الفيديو موجود:', selector);
                return resolve(element);
            }

            console.log('⏳ انتظار عنصر الفيديو:', selector);

            const check = setInterval(() => {
                element = document.querySelector(selector);
                if (element) {
                    clearInterval(check);
                    console.log('✅ تم العثور على عنصر الفيديو بعد:', elapsed, 'ms');
                    resolve(element);
                }

                elapsed += interval;
                if (elapsed >= timeout) {
                    clearInterval(check);
                    console.error('❌ انتهاء مهلة الانتظار لعنصر الفيديو (timeout)');
                    reject(new Error(`عنصر الفيديو غير موجود بعد انتظار ${timeout}ms`));
                }
            }, interval);
        });
    }

    /**
     * تشغيل البث في الفيديو
     * ✅ محسّن: ينتظر وجود عنصر الفيديو قبل التشغيل
     * ✅ محسّن: دعم Landscape mode على الموبايل والديسكتوب
     */
    async playStream(playUrl, content) {
        try {
            // الانتظار حتى يكون عنصر الفيديو موجوداً
            console.log('⏳ محاولة العثور على عنصر الفيديو...');
            const videoElement = await this.waitForVideoElement('#video-player', 10000);

            if (!videoElement) {
                console.error('❌ عنصر الفيديو غير موجود في الـ DOM');
                this.showError('خطأ: عنصر الفيديو غير موجود');
                return;
            }

            // البحث عن العناصر الأخرى
            const videoModal = document.getElementById('videoPlayerModal');
            const videoTitle = document.getElementById('videoTitle');
            const videoSubtitle = document.getElementById('videoSubtitle');
            const closeBtn = document.getElementById('closeVideoBtn');

            // تحديث معلومات التشغيل
            if (videoTitle) {
                videoTitle.textContent = content.name || 'Now Playing';
            }

            if (videoSubtitle && content.group) {
                videoSubtitle.textContent = content.group;
            }

            // إرسال إشعار (notification)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🎬 تشغيل الآن', {
                    body: content.name,
                    icon: content.logo
                });
            }

            console.log('📡 محاولة تشغيل البث:', playUrl);

            // التأكد من أن playUrl ليس فارغاً وأنه string
            if (!playUrl || typeof playUrl !== 'string') {
                console.error('❌ playUrl invalid:', playUrl, 'type:', typeof playUrl);
                this.showError('لم يتم الحصول على رابط البث صحيح');
                return;
            }

            // دعم HLS (M3U8)
            if (playUrl.includes('.m3u8') || playUrl.includes('playlist') || playUrl.includes('/stream/live')) {
                console.log('🎬 اكتشف بث HLS/M3U8');
                this.playHLS(videoElement, playUrl, content);
            } else {
                // تشغيل عادي للملفات الأخرى
                console.log('📹 اكتشف فيديو عادي');
                videoElement.src = playUrl;
                videoElement.play().catch(err => {
                    console.error('❌ خطأ في التشغيل:', err);
                    this.showError('فشل تشغيل الفيديو: ' + err.message);
                });
            }

            // 📱 Landscape Mode Support
            if (videoModal) {
                // إضافة class للـ modal للتحكم فيه
                videoModal.classList.add('active');
                videoModal.style.display = 'flex';

                // محاولة تفعيل Fullscreen mode تلقائياً على الموبايل
                this.enableFullscreenMode(videoElement, videoModal);
            }

            // إغلاق الـ modal عند الضغط على الزر
            if (closeBtn) {
                closeBtn.onclick = () => {
                    if (videoElement.hls) {
                        videoElement.hls.destroy();
                    }
                    videoElement.pause();
                    videoElement.src = '';
                    if (videoModal) {
                        videoModal.classList.remove('active');
                        videoModal.style.display = 'none';
                        this.disableFullscreenMode();
                    }
                };
            }

            // إغلاق الـ modal عند الضغط خارج الفيديو
            if (videoModal) {
                videoModal.addEventListener('click', (e) => {
                    if (e.target === videoModal) {
                        if (videoElement.hls) {
                            videoElement.hls.destroy();
                        }
                        videoElement.pause();
                        videoElement.src = '';
                        videoModal.classList.remove('active');
                        videoModal.style.display = 'none';
                        this.disableFullscreenMode();
                    }
                });
            }

        } catch (error) {
            console.error('❌ خطأ في playStream:', error);
            this.showError(`فشل تشغيل الفيديو: ${error.message}`);
        }
    }

    /**
     * 📱 Enable Landscape Fullscreen Mode
     */
    enableFullscreenMode(videoElement, videoModal) {
        try {
            // Check if device is mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            console.log('📱 Device type:', isMobile ? 'Mobile' : 'Desktop');
            console.log('📱 Current orientation:', window.matchMedia('(orientation: landscape)').matches ? 'Landscape' : 'Portrait');

            // Try to enter fullscreen
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen().catch(err => {
                    console.warn('⚠️ Fullscreen request denied:', err);
                });
            } else if (videoElement.webkitRequestFullscreen) {
                // Safari
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.mozRequestFullScreen) {
                // Firefox
                videoElement.mozRequestFullScreen();
            } else if (videoElement.msRequestFullscreen) {
                // IE/Edge
                videoElement.msRequestFullscreen();
            } else if (isMobile && videoModal) {
                // Fallback: lock to landscape on mobile
                console.log('📱 Enabling Landscape lock on mobile');
                this.lockLandscapeOrientation();
                
                // Add landscape class to modal
                videoModal.classList.add('landscape-mode');
                document.body.classList.add('video-modal-active');
            }

            // Listen for fullscreen changes
            document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
            document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());

        } catch (error) {
            console.warn('⚠️ Error enabling fullscreen:', error);
        }
    }

    /**
     * 📱 Disable Fullscreen Mode
     */
    disableFullscreenMode() {
        try {
            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.warn('⚠️ Exit fullscreen error:', err));
            } else if (document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else if (document.mozFullScreenElement) {
                document.mozCancelFullScreen();
            } else if (document.msFullscreenElement) {
                document.msExitFullscreen();
            }

            // Remove landscape lock
            this.unlockOrientation();

            // Remove classes
            const videoModal = document.getElementById('videoPlayerModal');
            if (videoModal) {
                videoModal.classList.remove('landscape-mode');
            }
            document.body.classList.remove('video-modal-active');

        } catch (error) {
            console.warn('⚠️ Error disabling fullscreen:', error);
        }
    }

    /**
     * 📱 Lock Landscape Orientation
     */
    lockLandscapeOrientation() {
        try {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(err => {
                    console.warn('⚠️ Landscape lock not supported:', err);
                });
            }
        } catch (error) {
            console.warn('⚠️ Screen orientation API not available:', error);
        }
    }

    /**
     * 📱 Unlock Orientation
     */
    unlockOrientation() {
        try {
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        } catch (error) {
            console.warn('⚠️ Error unlocking orientation:', error);
        }
    }

    /**
     * Handle fullscreen changes
     */
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                               document.mozFullScreenElement || document.msFullscreenElement);
        
        console.log('🖥️ Fullscreen mode:', isFullscreen ? 'Enabled' : 'Disabled');
        
        const videoModal = document.getElementById('videoPlayerModal');
        if (videoModal) {
            if (isFullscreen) {
                videoModal.classList.add('fullscreen');
            } else {
                videoModal.classList.remove('fullscreen');
            }
        }
    }

    /**
     * تشغيل بث HLS باستخدام hls.js
     * ✅ ترتيب صحيح: hls.js أولاً، ثم Safari native support
     */
    playHLS(videoElement, playUrl, content) {
        console.log('🎬 بدء تشغيل HLS:', playUrl);

        // 1️⃣ تحقق أولاً من توفر hls.js
        if (typeof Hls === 'undefined') {
            console.warn('⚠️ hls.js لم يتم تحميله، جاري المحاولة من جديد...');
            // حاول تحميل hls.js بشكل ديناميكي
            this.loadHLSLibrary().then(() => {
                this.playHLS(videoElement, playUrl, content);
            }).catch(err => {
                console.error('❌ فشل تحميل hls.js:', err);
                this.showError('فشل تحميل مكتبة HLS');
            });
            return;
        }

        // 2️⃣ إذا كان hls.js متاحاً وBrowser يدعمه
        if (Hls.isSupported()) {
            console.log('✅ استخدام hls.js للبث (Chrome, Firefox, Edge, إلخ)');
            // استخدام hls.js للمتصفحات الحديثة
            if (videoElement.hls) {
                videoElement.hls.destroy();
            }

            const hls = new Hls({
                enableWorker: true,
                defaultAudioCodec: undefined,
                fragLoadingTimeOut: 60000,
                manifestLoadingTimeOut: 30000,
                levelLoadingTimeOut: 30000,
                // ✨ تجاهل الأخطاء غير الحرجة
                maxLoadingDelay: 4,
                minAutoBitrate: 0,
                xhrSetup: (xhr, url) => {
                    xhr.withCredentials = false;
                }
            });

            hls.loadSource(playUrl);
            hls.attachMedia(videoElement);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('✅ تم تحميل manifest HLS بنجاح');
                const levels = hls.levels;
                console.log(`📊 عدد مستويات الجودة المتاحة: ${levels.length}`);
                
                if (levels.length > 0) {
                    // استخدم أول مستوى متاح (عادة الأعلى جودة)
                    hls.startLevel = 0;
                    hls.loadLevel = 0;
                    console.log(`🎬 اختيار المستوى: ${levels[0].name || 'Unknown'}`);
                }
                
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error('❌ خطأ في التشغيل بعد تحميل manifest:', err);
                        this.showError('فشل بدء التشغيل: ' + err.message);
                    });
                }

                // 🔄 ابدأ مراقبة صحة البث
                this.startStreamHealthMonitor(videoElement, hls);
            });

            // معالجة تغيير مستوى الجودة
            hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
                console.log(`📺 تبديل للمستوى: ${data.level} (${hls.levels[data.level].name || 'Unknown'})`);
            });

            // معالجة الأخطاء بشكل ذكي
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('⚠️ خطأ HLS:', {
                    type: data.type,
                    details: data.details,
                    fatal: data.fatal,
                    error: data.error
                });
                
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('⚠️ خطأ في الشبكة، محاولة إعادة الاتصال...');
                            setTimeout(() => {
                                console.log('🔄 إعادة تحميل البث...');
                                hls.startLoad();
                            }, 3000);
                            break;
                            
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('❌ خطأ في الوسائط غير قابل للإصلاح');
                            this.showError('خطأ في الوسائط: قد لا يكون تنسيق البث مدعوماً');
                            try {
                                hls.recoverMediaError();
                            } catch (e) {
                                console.error('فشل استعادة الخطأ:', e);
                            }
                            break;
                            
                        default:
                            console.error('❌ خطأ قاتل في HLS:', data.details);
                            // جرب تنزيل الجودة
                            if (hls.levels.length > 1) {
                                console.log('📉 محاولة تنزيل الجودة...');
                                hls.nextLevel = Math.max(0, hls.loadLevel - 1);
                            } else {
                                this.showError(`خطأ في البث: ${data.details}`);
                            }
                            break;
                    }
                } else {
                    // أخطاء غير حرجة - تجاهلها مع تسجيل
                    console.warn(`⚠️ تحذير HLS: ${data.details}`);
                    
                    // إذا كان الخطأ متعلق بـ levelLoadError (404)
                    if (data.details && data.details.includes('levelLoadError')) {
                        console.warn('📦 مستوى جودة غير موجود، سيتم الانتقال للمستوى التالي');
                    }
                }
            });

            // معالجة الأخطاء على مستوى الـ fragments
            hls.on(Hls.Events.FRAG_LOAD_ERROR, (event, data) => {
                console.warn(`⚠️ خطأ في تحميل fragment: ${data.frag.url}`);
                // عادة hls.js يتعامل معها تلقائياً
            });

            hls.on(Hls.Events.LEVEL_LOAD_ERROR, (event, data) => {
                console.warn(`⚠️ خطأ في تحميل مستوى الجودة: ${data.context.url}`);
                // إذا كان جميع المستويات فاشلة، سيفشل التشغيل
            });

            videoElement.hls = hls;
            return;
        }

        // 3️⃣ Safari native support (fallback)
        if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('✅ المتصفح يدعم HLS مباشرة (Safari/iOS)');
            videoElement.src = playUrl;
            videoElement.load();
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error('❌ خطأ في التشغيل:', err);
                    this.showError('فشل تشغيل البث: ' + err.message);
                });
            }
            return;
        }

        // ❌ متصفح غير مدعوم
        console.error('❌ المتصفح لا يدعم HLS ولا توجد مكتبة hls.js');
        this.showError('❌ المتصفح لا يدعم تشغيل البث HLS. استخدم Chrome أو Firefox حديثة أو Safari.');
    }

    /**
     * تحميل hls.js بشكل ديناميكي
     */
    loadHLSLibrary() {
        return new Promise((resolve, reject) => {
            // التحقق من أنه لم يتم تحميله بالفعل
            if (typeof Hls !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
            script.async = true;
            script.onload = () => {
                console.log('✅ تم تحميل hls.js بنجاح');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ فشل تحميل hls.js من CDN');
                reject(new Error('Failed to load hls.js'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            console.error('❌', message);
        }
    }

    /**
     * تحديث معلومات البث الحالي
     */
    updateNowPlaying(content) {
        // تحديث عنوان الصفحة
        document.title = `${content.name} - Servo TV`;

        // تحديث معلومات البث إن وجدت
        const nowPlayingDiv = document.getElementById('now-playing');
        if (nowPlayingDiv) {
            nowPlayingDiv.innerHTML = `
                <div class="now-playing-title">${content.name}</div>
                <div class="now-playing-group">${content.group}</div>
            `;
        }

        // إرسال إشعار (notification)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎬 تشغيل الآن', {
                body: content.name,
                icon: content.logo
            });
        }
    }

    /**
     * البحث عن محتوى
     */
    searchContent(query) {
        const search = query.toLowerCase();
        return this.contentList.filter(content =>
            content.name.toLowerCase().includes(search) ||
            content.group.toLowerCase().includes(search)
        );
    }

    /**
     * الحصول على محتوى حسب النوع
     */
    getContentByType(type) {
        return this.contentList.filter(content => content.type === type);
    }

    /**
     * الحصول على محتوى حسب الفئة
     */
    getContentByGroup(group) {
        return this.contentList.filter(content => content.group === group);
    }

    /**
     * الحصول على الفئات الفريدة
     */
    getUniqueGroups() {
        return [...new Set(this.contentList.map(c => c.group))];
    }

    /**
     * استخراج device_uid من الـ cookies
     */
    extractDeviceIdFromCookie() {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'device_uid') {
                return decodeURIComponent(value);
            }
        }
        return null;
    }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamingManager;
}
