/**
 * 🔍 Device Detector
 * 
 * يكتشف نوع الجهاز تلقائياً:
 * - متصفح ويب → استخدم HLS Player
 * - شاشة/Roku → استخدم IPTV Player
 */

class DeviceDetector {
    constructor() {
        this.isBrowser = null;
        this.init();
    }

    /**
     * تهيئة الكاشف
     */
    async init() {
        console.log('🔍 بدء كشف نوع الجهاز...');
        
        try {
            // الكشف من Backend API (الطريقة الموثوقة)
            await this.detectFromBackend();
            
            // إذا فشل Backend، استخدم JavaScript
            if (this.isBrowser === null) {
                this.detectFromBrowser();
            }
            
            this.logDetectionResult();
            this.handleDeviceType();
        } catch (error) {
            console.error('❌ خطأ في الكشف:', error);
            // بشكل افتراضي اعتبره متصفح
            this.isBrowser = true;
            this.handleDeviceType();
        }
    }

    /**
     * الكشف من Backend API
     */
    async detectFromBackend() {
        try {
            const response = await fetch('/api/device/type', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                console.warn('⚠️ فشل الكشف من Backend');
                return;
            }

            const data = await response.json();
            
            if (data.success) {
                this.isBrowser = data.is_browser;
                console.log('✅ تم الكشف من Backend:', {
                    device_type: data.device_type,
                    is_browser: this.isBrowser
                });
            }
        } catch (error) {
            console.warn('⚠️ خطأ في اتصال Backend:', error);
        }
    }

    /**
     * الكشف من متصفح JavaScript
     */
    detectFromBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // مؤشرات الشاشات
        const screenIndicators = [
            'roku',
            'android tv',
            'smarttv',
            'appletv',
            'webos',
            'tizen',
            'orsay',
            'hbbtv',
            'gvf',
            'dlnadoc'
        ];
        
        // التحقق من شاشات
        for (let indicator of screenIndicators) {
            if (userAgent.includes(indicator)) {
                this.isBrowser = false;
                console.log('📺 تم الكشف: شاشة/Roku');
                return;
            }
        }
        
        // بشكل افتراضي = متصفح
        this.isBrowser = true;
        console.log('🌐 تم الكشف: متصفح ويب');
    }

    /**
     * تسجيل نتيجة الكشف
     */
    logDetectionResult() {
        if (this.isBrowser) {
            console.log('✅ النتيجة: متصفح ويب → سيتم استخدام HLS Player');
        } else {
            console.log('✅ النتيجة: شاشة/Roku → سيتم استخدام IPTV Player');
        }
    }

    /**
     * معالجة نوع الجهاز
     */
    handleDeviceType() {
        if (this.isBrowser) {
            // توجيه إلى HLS Player
            window.location.href = '/hls-player';
        } else {
            // إبقاء IPTV Player (أو توجيهه إلى iptv-player)
            // إذا كانت الصفحة الحالية ليست iptv-player بالفعل
            if (!window.location.pathname.includes('iptv')) {
                window.location.href = '/user/iptv-player';
            }
        }
    }

    /**
     * الحصول على نوع الجهاز
     */
    getDeviceType() {
        return this.isBrowser ? 'browser' : 'screen';
    }

    /**
     * التحقق من أن الجهاز متصفح
     */
    isBrowserDevice() {
        return this.isBrowser === true;
    }

    /**
     * التحقق من أن الجهاز شاشة
     */
    isScreenDevice() {
        return this.isBrowser === false;
    }
}

// إنشاء instance عام
const deviceDetector = new DeviceDetector();
