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
            
            const response = await fetch(this.playlistUrl);
            
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
                this.contentList.push(content);
            }
        }
    }

    /**
     * استخراج معلومات من EXTINF
     */
    parseEXTINF(extinf) {
        return {
            id: extinf.match(/tvg-id="([^"]*)"/)?.[1] || '',
            name: extinf.match(/,(.+)$/)?.[1]?.trim() || 'Unknown',
            logo: extinf.match(/tvg-logo="([^"]*)"/)?.[1] || '',
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
     */
    async playContent(content) {
        try {
            console.log('▶️ تشغيل:', content.name);
            
            this.currentContent = content;

            // جلب play URL من Backend
            const playUrl = await this.getPlayUrl(content);

            // تشغيل في player
            this.playStream(playUrl, content);

            return playUrl;
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.showError(`فشل تشغيل ${content.name}: ${error.message}`);
            throw error;
        }
    }

    /**
     * جلب Play URL من Backend
     */
    async getPlayUrl(content) {
        try {
            const response = await fetch('/api/stream/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stream_url: content.streamUrl,
                    content_id: content.id,
                    content_name: content.name
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'فشل الحصول على play URL');
            }

            console.log('✅ تم الحصول على Play URL');
            return data.play_url;
        } catch (error) {
            console.error('❌ خطأ في جلب Play URL:', error);
            throw error;
        }
    }

    /**
     * تشغيل البث في الفيديو
     */
    playStream(playUrl, content) {
        // البحث عن عنصر الفيديو
        let videoElement = document.getElementById('video-player');
        
        if (!videoElement) {
            // إنشاء عنصر فيديو إذا لم يكن موجوداً
            videoElement = document.createElement('video');
            videoElement.id = 'video-player';
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.controls = true;
            videoElement.autoplay = true;
            document.body.appendChild(videoElement);
        }

        // تحديث معلومات التشغيل الحالي
        const nowPlayingDiv = document.querySelector('.now-playing-info');
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

        console.log('📡 محاولة تشغيل البث:', playUrl);

        // التأكد من أن playUrl ليس فارغاً
        if (!playUrl) {
            this.showError('لم يتم الحصول على رابط البث');
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
    }

    /**
     * تشغيل بث HLS باستخدام hls.js
     */
    playHLS(videoElement, playUrl, content) {
        console.log('🎬 بدء تشغيل HLS:', playUrl);

        // التحقق من دعم HLS في المتصفح
        if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari والمتصفحات التي تدعم HLS مباشرة
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

        // التحقق من توفر hls.js
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

        if (Hls.isSupported()) {
            console.log('✅ استخدام hls.js للبث');
            // استخدام hls.js للمتصفحات الأخرى
            if (videoElement.hls) {
                videoElement.hls.destroy();
            }

            const hls = new Hls({
                enableWorker: true,
                defaultAudioCodec: undefined,
                fragLoadingTimeOut: 60000,  // 60 ثانية
                manifestLoadingTimeOut: 30000,  // 30 ثانية
                levelLoadingTimeOut: 30000,  // 30 ثانية
                xhrSetup: (xhr) => {
                    // إضافة headers لتجنب CORS issues
                    xhr.withCredentials = false;
                }
            });

            hls.loadSource(playUrl);
            hls.attachMedia(videoElement);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('✅ تم تحميل manifest HLS بنجاح');
                const levels = hls.levels;
                console.log(`📊 عدد جودات البث: ${levels.length}`);
                
                const playPromise = videoElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error('❌ خطأ في التشغيل بعد تحميل manifest:', err);
                        this.showError('فشل بدء التشغيل: ' + err.message);
                    });
                }
            });

            hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
                console.log(`📺 تم التبديل للجودة: ${data.level}`);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('❌ خطأ في HLS:', data);
                
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('⚠️ خطأ في الشبكة، محاولة إعادة الاتصال...');
                            setTimeout(() => hls.startLoad(), 3000);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('❌ خطأ في الوسائط غير قابل للإصلاح');
                            this.showError('خطأ في الوسائط: قد لا يكون تنسيق البث مدعوماً');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('❌ خطأ قاتل في HLS:', data);
                            this.showError('خطأ في البث: ' + data.details);
                            break;
                    }
                } else {
                    console.warn('⚠️ تحذير غير قاتل في HLS:', data);
                }
            });

            hls.on(Hls.Events.BUFFER_APPENDING, () => {
                // يتم استدعاؤه عند بدء إضافة البيانات
            });

            hls.on(Hls.Events.FRAG_LOADED, () => {
                // Fragment تم تحميله بنجاح
            });

            videoElement.hls = hls;
        } else {
            // المتصفح لا يدعم HLS - محاولة التشغيل المباشر كملاذ أخير
            console.warn('⚠️ المتصفح قد لا يدعم HLS، محاولة التشغيل المباشر...');
            videoElement.src = playUrl;
            videoElement.load();
            
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error('❌ خطأ في التشغيل المباشر:', err);
                    this.showError('المتصفح الحالي لا يدعم تشغيل البث المباشر. رجاء استخدم متصفح حديث أو Safari.');
                });
            }
        }
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
