/**
 * 🚨 Error Handler & Loader Manager
 * 
 * يدير:
 * 1. معالجة الأخطاء بشكل آمن
 * 2. التحقق من العناصر قبل الاستخدام
 * 3. عرض رسائل مفيدة للمستخدم
 */

class AppManager {
    constructor() {
        this.errors = [];
        this.isReady = false;
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        console.log('🚀 بدء تهيئة تطبيق...');
        
        try {
            // التحقق من الاتصال بالـ API
            await this.checkApiConnection();
            
            this.isReady = true;
            console.log('✅ تطبيق جاهز');
        } catch (error) {
            console.error('❌ فشل التهيئة:', error);
            this.showFatalError('فشل تحميل التطبيق. يرجى تحديث الصفحة.');
        }
    }

    /**
     * التحقق من الاتصال بـ API
     */
    async checkApiConnection() {
        try {
            const response = await fetch(`${window.location.origin}/api/health`, {
                method: 'GET',
                timeout: 5000
            }).catch(() => {
                throw new Error('فشل الاتصال بالسيرفر');
            });

            if (!response.ok) {
                throw new Error(`حالة الاتصال: ${response.status}`);
            }

            console.log('✅ السيرفر متاح');
        } catch (error) {
            console.warn('⚠️ تحذير الاتصال:', error.message);
            // لا نمنع التطبيق من العمل حتى لو فشل الاتصال الأول
        }
    }

    /**
     * التحقق من وجود عنصر
     */
    static checkElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`⚠️ العنصر "${selector}" غير موجود`);
        }
        return element;
    }

    /**
     * عرض رسالة خطأ فادحة
     */
    showFatalError(message) {
        const html = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: #2a2a2a;
                    padding: 30px;
                    border-radius: 10px;
                    text-align: center;
                    max-width: 400px;
                    color: white;
                    border: 2px solid #ef4444;
                ">
                    <h2 style="margin: 0 0 10px 0; color: #ef4444;">❌ خطأ</h2>
                    <p style="margin: 10px 0; font-size: 14px;">${message}</p>
                    <button onclick="window.location.reload()" style="
                        padding: 10px 20px;
                        background: #3b82f6;
                        border: none;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 15px;
                    ">
                        تحديث الصفحة
                    </button>
                </div>
            </div>
        `;
        document.body.innerHTML = html;
    }

    /**
     * عرض رسالة تحذير
     */
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        const colors = {
            'error': '#ef4444',
            'warning': '#f59e0b',
            'success': '#10b981',
            'info': '#3b82f6'
        };

        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10001;
            font-size: 14px;
            animation: slideIn 300ms ease;
        `;

        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), duration);
    }

    /**
     * معالج آمن للأخطاء
     */
    static safeCall(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            console.error('⚠️ خطأ آمن:', error);
            return fallback;
        }
    }
}

/**
 * إنشاء instance عام للتطبيق
 */
const appManager = new AppManager();

/**
 * تهيئة عند تحميل الصفحة
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        appManager.init();
    });
} else {
    appManager.init();
}

/**
 * معالج الأخطاء الشامل
 */
window.addEventListener('error', (event) => {
    console.error('🚨 خطأ في الصفحة:', event.error);
    AppManager.showToast('حدث خطأ غير متوقع', 'error');
});

/**
 * معالج الأخطاء غير المعالجة في Promise
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promise غير معالج:', event.reason);
    AppManager.showToast('حدث خطأ - يرجى المحاولة مرة أخرى', 'error');
});

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppManager;
}
