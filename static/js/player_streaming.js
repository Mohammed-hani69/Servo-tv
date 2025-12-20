/**
 * 🎬 Servo TV Player Manager with Real Streaming Support
 * يدعم البث الحقيقي من API الخادم
 */

class StreamingPlayerManager {
    constructor() {
        // DOM Elements
        this.videoPlayer = document.getElementById('videoPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.channelName = document.getElementById('channelName');
        this.channelInfo = document.getElementById('channelInfo');
        this.channelsList = document.getElementById('channelsList');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingSpinner = document.getElementById('loadingSpinner');

        // State
        this.isPlaying = true;
        this.isMuted = true;
        this.currentStream = null;
        this.streams = [];

        // Initialize
        this.init();
    }

    /**
     * تهيئة المشغل
     */
    async init() {
        console.log('🎬 بدء تهيئة مشغل البث...');
        
        try {
            // جلب الـ Stream Token
            await this.fetchStreamToken();
            
            // جلب قائمة البث
            await this.fetchPlaylist();
            
            // تحضير الـ UI
            this.setupUI();
            
            // تشغيل أول قناة
            if (this.streams.length > 0) {
                this.playStream(this.streams[0]);
            }
            
            console.log('✅ تم تهيئة المشغل بنجاح');
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            this.showError('Failed to initialize player: ' + error.message);
        }
    }

    /**
     * جلب Stream Token
     */
    async fetchStreamToken() {
        try {
            console.log('🔑 جاري طلب Stream Token...');
            
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
                throw new Error(data.message || 'Failed to get stream token');
            }

            this.playlistUrl = data.playlist_url;
            console.log('✅ تم الحصول على Stream Token');
            
            return data;
        } catch (error) {
            console.error('❌ خطأ في جلب Token:', error);
            throw error;
        }
    }

    /**
     * جلب قائمة البث (M3U)
     */
    async fetchPlaylist() {
        try {
            if (!this.playlistUrl) {
                throw new Error('No playlist URL available');
            }

            console.log('📻 جاري تحميل قائمة البث...');
            
            const response = await fetch(this.playlistUrl);
            
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn('⚠️ Token غير صالح، جاري إعادة المحاولة...');
                    await this.fetchStreamToken();
                    return this.fetchPlaylist(); // إعادة المحاولة
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const m3uContent = await response.text();
            this.parseM3U(m3uContent);
            
            console.log(`✅ تم تحميل ${this.streams.length} بث`);
        } catch (error) {
            console.error('❌ خطأ في تحميل البث:', error);
            throw error;
        }
    }

    /**
     * تحليل ملف M3U
     */
    parseM3U(content) {
        this.streams = [];
        const lines = content.split('\n');
        let currentStream = {};

        for (let line of lines) {
            line = line.trim();
            
            if (line.startsWith('#EXTINF:')) {
                // استخراج معلومات القناة
                const nameMatch = line.match(/,(.+)$/);
                currentStream = {
                    name: nameMatch ? nameMatch[1].trim() : 'Unknown',
                    logo: this.extractLogo(line),
                    group: this.extractGroup(line),
                };
            } else if (line && !line.startsWith('#')) {
                // رابط البث
                currentStream.url = line;
                
                if (currentStream.name && currentStream.url) {
                    this.streams.push(currentStream);
                    currentStream = {};
                }
            }
        }

        console.log(`📊 تم تحليل ${this.streams.length} بث`);
    }

    /**
     * استخراج شعار القناة
     */
    extractLogo(extinf) {
        const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);
        return logoMatch ? logoMatch[1] : null;
    }

    /**
     * استخراج مجموعة القناة
     */
    extractGroup(extinf) {
        const groupMatch = extinf.match(/group-title="([^"]+)"/);
        return groupMatch ? groupMatch[1] : 'Other';
    }

    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        // تحضير قائمة الأبناء
        this.renderChannelsList();

        // ربط الأزرار
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        this.rewindBtn?.addEventListener('click', () => this.rewind());
        this.forwardBtn?.addEventListener('click', () => this.forward());
        this.volumeBtn?.addEventListener('click', () => this.toggleMute());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        // شريط التقدم
        this.progressSlider?.addEventListener('input', (e) => this.seek(e.target.value));
        
        // تحديث شريط التقدم
        this.videoPlayer?.addEventListener('timeupdate', () => this.updateProgress());
        this.videoPlayer?.addEventListener('loadedmetadata', () => this.updateDuration());
        this.videoPlayer?.addEventListener('canplay', () => {
            console.log('✅ البث جاهز للتشغيل');
            this.hideLoadingSpinner();
        });
        this.videoPlayer?.addEventListener('playing', () => {
            console.log('▶️ البث يعمل الآن');
        });
        this.videoPlayer?.addEventListener('stalled', () => {
            console.warn('⚠️ البث متوقف مؤقتاً، جاري انتظار البيانات...');
        });
        this.videoPlayer?.addEventListener('waiting', () => {
            console.log('⏳ انتظار البيانات...');
        });
        this.videoPlayer?.addEventListener('error', (e) => {
            const error = this.videoPlayer.error;
            let errorMsg = 'Failed to play stream';
            if (error) {
                switch(error.code) {
                    case error.MEDIA_ERR_ABORTED:
                        errorMsg = 'Playback aborted';
                        break;
                    case error.MEDIA_ERR_NETWORK:
                        errorMsg = 'Network error - check URL or connection';
                        break;
                    case error.MEDIA_ERR_DECODE:
                        errorMsg = 'Decode error - invalid video format';
                        break;
                    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMsg = 'Video format not supported';
                        break;
                }
            }
            console.error('❌ خطأ في تشغيل الفيديو:', errorMsg, error);
            this.hideLoadingSpinner();
            this.showError(errorMsg);
        });

        // لوحة مفاتيح
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    /**
     * رسم قائمة الأبناء
     */
    renderChannelsList() {
        if (!this.channelsList) return;
        
        this.channelsList.innerHTML = '';

        for (let i = 0; i < Math.min(this.streams.length, 20); i++) {
            const stream = this.streams[i];
            const item = document.createElement('div');
            item.className = 'channel-item';
            item.innerHTML = `
                ${stream.logo ? `<img src="${stream.logo}" class="channel-logo" alt="${stream.name}">` : '<div class="channel-logo-placeholder">📺</div>'}
                <div class="channel-details">
                    <div class="channel-name-small">${stream.name}</div>
                    <div class="channel-group">${stream.group}</div>
                </div>
            `;
            item.addEventListener('click', () => this.playStream(stream));
            this.channelsList.appendChild(item);
        }
    }

    /**
     * تشغيل بث
     */
    async playStream(stream) {
        try {
            console.log(`▶️ تشغيل: ${stream.name}`);
            
            this.currentStream = stream;
            this.showLoadingSpinner();

            // إرسال طلب تشغيل للخادم
            const response = await fetch('/api/stream/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stream_url: stream.url,
                    content_id: stream.name.replace(/\s+/g, '_'),
                    content_name: stream.name
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to play stream');
            }

            // تحديث واجهة المستخدم
            this.channelName.textContent = stream.name;
            this.channelInfo.textContent = stream.group;

            // تشغيل البث
            if (data.play_url) {
                console.log('▶️ تشغيل رابط:', data.play_url);
                this.videoPlayer.src = data.play_url;
                
                // تحديد نوع البث بناءً على امتداد الملف
                if (data.play_url.includes('.m3u8')) {
                    this.videoPlayer.type = 'application/vnd.apple.mpegurl';
                } else {
                    this.videoPlayer.type = 'video/mp2t';
                }
                
                // محاولة التشغيل
                try {
                    this.videoPlayer.load();
                    const playPromise = this.videoPlayer.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('✅ تم بدء التشغيل');
                            this.isPlaying = true;
                            this.updatePlayPauseIcon();
                        }).catch(err => {
                            console.warn('⚠️ تحذير في التشغيل:', err);
                            // قد لا يكون التشغيل ممكناً فوراً، لكن المشغل قد يبدأ بعد قليل
                        });
                    }
                } catch (playError) {
                    console.warn('⚠️ خطأ في التشغيل:', playError);
                }
            } else {
                throw new Error('No play URL returned from server');
            }

            this.hideLoadingSpinner();
            console.log('✅ تم تشغيل البث بنجاح');
        } catch (error) {
            console.error('❌ خطأ في التشغيل:', error);
            this.hideLoadingSpinner();
            
            // معالجة أخطاء الخادم المختلفة
            let errorMessage = 'Failed to play stream';
            if (error.message.includes('502')) {
                errorMessage = 'Stream server error - try another channel';
            } else if (error.message.includes('503')) {
                errorMessage = 'Stream server unavailable - please wait';
            } else if (error.message.includes('504')) {
                errorMessage = 'Stream connection timeout - try again';
            } else if (error.message.includes('403')) {
                errorMessage = 'Access denied - subscription may have expired';
            }
            
            this.showError(errorMessage + ': ' + error.message);
        }
    }

    /**
     * تشغيل/إيقاف
     */
    togglePlayPause() {
        if (!this.videoPlayer) return;

        if (this.isPlaying) {
            this.videoPlayer.pause();
            this.isPlaying = false;
        } else {
            this.videoPlayer.play().catch(e => console.error('Play error:', e));
            this.isPlaying = true;
        }

        this.updatePlayPauseIcon();
    }

    /**
     * ملخص الصوت
     */
    toggleMute() {
        if (!this.videoPlayer) return;
        this.videoPlayer.muted = !this.videoPlayer.muted;
        this.isMuted = this.videoPlayer.muted;
    }

    /**
     * إعادة تشغيل 10 ثوان
     */
    rewind() {
        if (!this.videoPlayer) return;
        this.videoPlayer.currentTime = Math.max(0, this.videoPlayer.currentTime - 10);
    }

    /**
     * تقديم 10 ثوان
     */
    forward() {
        if (!this.videoPlayer) return;
        this.videoPlayer.currentTime = Math.min(
            this.videoPlayer.duration,
            this.videoPlayer.currentTime + 10
        );
    }

    /**
     * تحديث الأيقونة
     */
    updatePlayPauseIcon() {
        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
        }
    }

    /**
     * تحديث شريط التقدم
     */
    updateProgress() {
        if (!this.videoPlayer || !this.progressFill) return;

        const percent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100 || 0;
        this.progressFill.style.width = percent + '%';

        if (this.progressSlider) {
            this.progressSlider.value = percent;
        }
    }

    /**
     * تحديث المدة
     */
    updateDuration() {
        if (!this.videoPlayer || !this.progressSlider) return;
        this.progressSlider.max = this.videoPlayer.duration || 100;
    }

    /**
     * البحث
     */
    seek(percent) {
        if (!this.videoPlayer) return;
        const time = (percent / 100) * this.videoPlayer.duration;
        this.videoPlayer.currentTime = time;
    }

    /**
     * ملء الشاشة
     */
    toggleFullscreen() {
        const elem = document.querySelector('.player-wrapper');
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen?.().catch(e => console.error('Fullscreen error:', e));
        } else {
            document.exitFullscreen?.();
        }
    }

    /**
     * معالجة لوحة المفاتيح
     */
    handleKeydown(e) {
        switch(e.key.toLowerCase()) {
            case ' ':
            case 'enter':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'arrowup':
                e.preventDefault();
                // فتح قائمة الأبناء
                break;
            case 'arrowdown':
                e.preventDefault();
                // إغلاق قائمة الأبناء
                break;
            case 'arrowleft':
                this.rewind();
                break;
            case 'arrowright':
                this.forward();
                break;
            case 'm':
                this.toggleMute();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
        }
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        if (!this.errorMessage) return;
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    /**
     * عرض مؤشر التحميل
     */
    showLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
    }

    /**
     * إخفاء مؤشر التحميل
     */
    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerManager = new StreamingPlayerManager();
});
