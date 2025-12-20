/**
 * 🛑 Error Handler Module
 * 
 * يتعامل مع:
 * - أخطاء الاشتراك
 * - أخطاء الأجهزة
 * - عرض رسائل خطأ واضحة
 */

class ErrorHandler {
    constructor() {
        this.errorMap = {
            'DEVICE_DISABLED': {
                title: '❌ الجهاز معطّل',
                message: 'تم تعطيل هذا الجهاز. يرجى التواصل مع فريق الدعم.',
                action: 'support'
            },
            'SUBSCRIPTION_INVALID': {
                title: '❌ الاشتراك غير مفعل',
                message: 'الاشتراك غير مفعل أو منتهي الصلاحية. يرجى تجديد الاشتراك.',
                action: 'renew'
            },
            'DEVICE_NOT_FOUND': {
                title: '❌ الجهاز غير معروف',
                message: 'لم يتم التعرف على هذا الجهاز. يرجى تسجيل الجهاز مرة أخرى.',
                action: 'register'
            },
            'TOKEN_EXPIRED': {
                title: '❌ انتهت صلاحية التوكن',
                message: 'انتهت صلاحية التوكن. جاري إعادة التشغيل...',
                action: 'retry'
            },
            'MAX_DEVICES_EXCEEDED': {
                title: '❌ تم تجاوز حد الأجهزة',
                message: 'تم تجاوز الحد الأقصى للأجهزة المسموح به. يرجى ترقية الاشتراك.',
                action: 'upgrade'
            },
            'NETWORK_ERROR': {
                title: '❌ خطأ في الاتصال',
                message: 'فشل الاتصال بخادم البث. يرجى التحقق من الإنترنت.',
                action: 'retry'
            }
        };
    }

    /**
     * عرض رسالة خطأ
     */
    showError(errorCode, customMessage = null) {
        const error = this.errorMap[errorCode] || {
            title: '❌ خطأ',
            message: customMessage || 'حدث خطأ غير متوقع',
            action: 'retry'
        };

        // إنشاء modal للخطأ
        this.createErrorModal(error);

        // تسجيل الخطأ
        console.error(`[${errorCode}]`, error);
    }

    /**
     * إنشاء Modal للخطأ
     */
    createErrorModal(error) {
        // إزالة أي modal سابق
        const existingModal = document.getElementById('error-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'error-modal';
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <h2 class="error-title">${error.title}</h2>
                <p class="error-message">${error.message}</p>
                <div class="error-actions">
                    ${this.getActionButton(error.action)}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.injectErrorStyles();

        // إضافة Event Listeners
        this.attachErrorListeners();
    }

    /**
     * الحصول على زر الإجراء
     */
    getActionButton(action) {
        const buttons = {
            'support': `
                <button class="error-btn primary" onclick="window.location.href='/support'">
                    اتصل بالدعم
                </button>
            `,
            'renew': `
                <button class="error-btn primary" onclick="window.location.href='/renew-subscription'">
                    تجديد الاشتراك
                </button>
            `,
            'register': `
                <button class="error-btn primary" onclick="window.location.href='/register'">
                    تسجيل الجهاز
                </button>
            `,
            'retry': `
                <button class="error-btn primary" onclick="location.reload()">
                    إعادة محاولة
                </button>
            `,
            'upgrade': `
                <button class="error-btn primary" onclick="window.location.href='/upgrade'">
                    ترقية الاشتراك
                </button>
            `,
            'default': `
                <button class="error-btn primary" onclick="location.reload()">
                    إعادة محاولة
                </button>
            `
        };

        return buttons[action] || buttons['default'];
    }

    /**
     * إضافة Event Listeners
     */
    attachErrorListeners() {
        const modal = document.getElementById('error-modal');
        if (!modal) return;

        // إغلاق عند النقر خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // إغلاق عند الضغط على ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal) {
                modal.remove();
            }
        });
    }

    /**
     * إضافة CSS للأخطاء
     */
    injectErrorStyles() {
        if (document.getElementById('error-styles')) return;

        const style = document.createElement('style');
        style.id = 'error-styles';
        style.textContent = `
            .error-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            }

            .error-content {
                background: #1a1a1a;
                border: 2px solid #ef4444;
                border-radius: 12px;
                padding: 40px;
                max-width: 400px;
                text-align: center;
                color: white;
                box-shadow: 0 10px 40px rgba(239, 68, 68, 0.2);
                animation: slideUp 300ms ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .error-icon {
                font-size: 48px;
                margin-bottom: 20px;
                animation: bounce 600ms ease;
            }

            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            .error-title {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 12px 0;
                color: #ef4444;
            }

            .error-message {
                font-size: 14px;
                color: #cbd5e1;
                margin: 0 0 24px 0;
                line-height: 1.6;
            }

            .error-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .error-btn {
                padding: 10px 24px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 200ms ease;
                border: none;
                font-size: 14px;
            }

            .error-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .error-btn.primary:hover {
                background: #2563eb;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }

            .error-btn.secondary {
                background: transparent;
                border: 1px solid #64748b;
                color: #cbd5e1;
            }

            .error-btn.secondary:hover {
                border-color: #94a3b8;
                color: white;
            }

            @media (max-width: 480px) {
                .error-content {
                    margin: 20px;
                    padding: 24px;
                }

                .error-icon {
                    font-size: 36px;
                }

                .error-title {
                    font-size: 18px;
                }

                .error-message {
                    font-size: 13px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

/**
 * 🔄 Subscription Checker
 * فحص دوري لحالة الاشتراك
 */
class SubscriptionChecker {
    constructor(interval = 60000) {
        this.interval = interval; // 1 دقيقة
        this.checkInterval = null;
        this.errorHandler = new ErrorHandler();
    }

    /**
     * بدء الفحص الدوري
     */
    startChecking() {
        console.log('🔍 بدء فحص الاشتراك...');

        // فحص أولي
        this.check();

        // فحص دوري
        this.checkInterval = setInterval(() => {
            this.check();
        }, this.interval);
    }

    /**
     * إيقاف الفحص الدوري
     */
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            console.log('🛑 توقف فحص الاشتراك');
        }
    }

    /**
     * فحص الاشتراك
     */
    async check() {
        try {
            // الحصول على معرف الجهاز من الجلسة
            const response = await fetch('/api/device/status', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            // التحقق من حالة الجهاز
            if (!data.device.is_active) {
                this.errorHandler.showError(
                    'DEVICE_DISABLED',
                    `السبب: ${data.device.disabled_reason}`
                );
                this.stopChecking();
                return;
            }

            // التحقق من الاشتراك
            if (data.subscription.status !== 'active') {
                this.errorHandler.showError('SUBSCRIPTION_INVALID');
                this.stopChecking();
                return;
            }

            // تحذير إذا كان الاشتراك على وشك الانتهاء
            if (data.subscription.days_remaining < 7) {
                this.showWarning(
                    `⚠️ ينتهي اشتراكك خلال ${data.subscription.days_remaining} أيام`
                );
            }

        } catch (error) {
            console.error('❌ خطأ في فحص الاشتراك:', error);
        }
    }

    /**
     * عرض تحذير
     */
    showWarning(message) {
        const toast = document.createElement('div');
        toast.className = 'warning-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 300ms ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 300ms ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// تصدير الفئات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, SubscriptionChecker };
}

// بدء فحص الاشتراك تلقائياً
document.addEventListener('DOMContentLoaded', () => {
    if (typeof SubscriptionChecker !== 'undefined') {
        window.subscriptionChecker = new SubscriptionChecker(60000); // فحص كل دقيقة
        window.subscriptionChecker.startChecking();
    }
});
