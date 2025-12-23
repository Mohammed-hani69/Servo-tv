/**
 * تحسينات الأداء للـ Frontend
 * 
 * المشاكل المحلولة:
 * 1. عدم استخدام Caching للـ API responses
 * 2. تحميل البيانات المتكررة
 * 3. عدم استخدام Request Debouncing
 * 4. عدم تقليل حجم الصور
 */

// ============================================================================
// 1️⃣ Simple Client-Side Cache
// ============================================================================

class APICache {
    constructor(ttl = 300000) {
        // TTL = 5 دقائق بالـ milliseconds
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * جلب من الـ Cache
     * @param {string} key - مفتاح الـ cache
     * @returns {any|null} البيانات أو null إذا انتهت صلاحية
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // التحقق من انتهاء الصلاحية
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        console.log(`✅ Cache HIT: ${key}`);
        return item.value;
    }

    /**
     * حفظ في الـ Cache
     * @param {string} key - مفتاح الـ cache
     * @param {any} value - القيمة المراد حفظها
     */
    set(key, value) {
        this.cache.set(key, {
            value: value,
            expiresAt: Date.now() + this.ttl
        });

        console.log(`💾 Cache SET: ${key}`);
    }

    /**
     * حذف من الـ Cache
     * @param {string} key - مفتاح الـ cache
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * حذف كل الـ Cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * حذف جميع العناصر المنتهية الصلاحية
     */
    cleanup() {
        const now = Date.now();
        for (let [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

// إنشاء instance من الـ cache
const apiCache = new APICache(300000); // 5 دقائق

// تنظيف الـ cache كل دقيقة
setInterval(() => {
    apiCache.cleanup();
    console.log('🧹 Cache cleanup completed');
}, 60000);

// ============================================================================
// 2️⃣ Optimized Fetch with Caching
// ============================================================================

/**
 * جلب البيانات مع Caching تلقائي
 * @param {string} url - رابط الـ API
 * @param {object} options - خيارات الـ fetch
 * @param {boolean} useCache - استخدام الـ cache أم لا
 * @returns {Promise<any>} البيانات
 */
async function cachedFetch(url, options = {}, useCache = true) {
    const cacheKey = `${url}:${JSON.stringify(options)}`;

    // محاولة جلب من الـ cache أولاً
    if (useCache) {
        const cached = apiCache.get(cacheKey);
        if (cached) {
            return cached;
        }
    }

    try {
        console.log(`🔄 Fetching: ${url}`);
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // حفظ في الـ cache
        if (useCache) {
            apiCache.set(cacheKey, data);
        }

        return data;
    } catch (error) {
        console.error(`❌ Fetch error: ${error.message}`);
        throw error;
    }
}

// ============================================================================
// 3️⃣ Request Debouncing (لتقليل عدد الـ API calls)
// ============================================================================

/**
 * Debounce function - تأخير تنفيذ الدالة إلى حين توقف الـ calls
 * 
 * مثال:
 * const debouncedSearch = debounce(async (query) => {
 *     const results = await fetch(`/api/search?q=${query}`);
 *     updateResults(results);
 * }, 500);
 * 
 * input.addEventListener('input', (e) => {
 *     debouncedSearch(e.target.value);
 * });
 */
function debounce(func, delay = 500) {
    let timeoutId = null;

    return function (...args) {
        // حذف الـ timeout السابق
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // تنفيذ الدالة بعد التأخير
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// ============================================================================
// 4️⃣ Request Throttling (لتقليل عدد الـ calls في فترة زمنية)
// ============================================================================

/**
 * Throttle function - تنفيذ الدالة مرة واحدة فقط في الفترة الزمنية المحددة
 * 
 * مثال:
 * const throttledScroll = throttle(() => {
 *     console.log('User scrolled');
 * }, 1000);
 * 
 * window.addEventListener('scroll', throttledScroll);
 */
function throttle(func, limit = 1000) {
    let inThrottle = false;

    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;

            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// ============================================================================
// 5️⃣ Lazy Loading للصور
// ============================================================================

/**
 * تفعيل Lazy Loading للصور
 * يتطلب في HTML:
 * <img loading="lazy" src="placeholder.jpg" data-src="actual-image.jpg" alt="...">
 */
function initLazyLoading() {
    // استخدام Intersection Observer API (أداء أفضل من scroll listener)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // جلب الصورة الحقيقية
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    // إيقاف المراقبة
                    observer.unobserve(img);
                }
            });
        });

        // مراقبة جميع الصور الـ lazy
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================================================
// 6️⃣ Image Optimization
// ============================================================================

/**
 * تحسين الصور تلقائياً
 * تقليل حجم الصور باستخدام CDN parameter (مثل Cloudinary أو ImageKit)
 */
function optimizeImageSrc(url, options = {}) {
    const {
        width = 300,
        height = 300,
        quality = 80,
        format = 'webp'
    } = options;

    // مثال لـ Cloudinary
    // https://res.cloudinary.com/demo/image/upload/w_300,h_300,q_80,f_webp/nature.jpg

    // أو ImageKit
    // https://ik.imagekit.io/demo/medium-applause.jpg?tr=w-300,h-300,q-80,f-webp

    // بدون CDN، يمكن إضافة parameters مباشرة
    if (url.includes('?')) {
        return `${url}&w=${width}&h=${height}&q=${quality}&f=${format}`;
    } else {
        return `${url}?w=${width}&h=${height}&q=${quality}&f=${format}`;
    }
}

// ============================================================================
// 7️⃣ Performance Monitoring
// ============================================================================

/**
 * قياس أداء العمليات
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
    }

    /**
     * بدء قياس الأداء
     * @param {string} label - اسم العملية
     */
    start(label) {
        this.metrics[label] = {
            startTime: performance.now(),
            endTime: null,
            duration: null
        };
    }

    /**
     * إنهاء قياس الأداء
     * @param {string} label - اسم العملية
     */
    end(label) {
        if (this.metrics[label]) {
            this.metrics[label].endTime = performance.now();
            this.metrics[label].duration = 
                this.metrics[label].endTime - this.metrics[label].startTime;

            const duration = this.metrics[label].duration;

            if (duration > 1000) {
                console.warn(`⚠️ SLOW: ${label} took ${duration.toFixed(2)}ms`);
            } else {
                console.log(`✅ ${label} took ${duration.toFixed(2)}ms`);
            }

            return duration;
        }
    }

    /**
     * الحصول على جميع المقاييس
     */
    getAll() {
        return this.metrics;
    }

    /**
     * طباعة تقرير الأداء
     */
    printReport() {
        console.table(this.metrics);
    }
}

// إنشاء instance من المراقب
const perfMonitor = new PerformanceMonitor();

// ============================================================================
// 8️⃣ استخدام الأمثلة
// ============================================================================

/**
 * مثال على استخدام cachedFetch
 */
async function example_cachedFetch() {
    try {
        const data = await cachedFetch('/api/device/status', {});
        console.log('Device status:', data);
    } catch (error) {
        console.error('Error fetching device status:', error);
    }
}

/**
 * مثال على استخدام Debounce
 */
function example_debounce() {
    const searchInput = document.getElementById('search');

    if (searchInput) {
        const debouncedSearch = debounce(async (query) => {
            console.log('Searching for:', query);
            const results = await cachedFetch(`/api/search?q=${query}`);
            console.log('Search results:', results);
        }, 500);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
}

/**
 * مثال على استخدام Performance Monitor
 */
function example_perfMonitor() {
    perfMonitor.start('page-load');

    // محاكاة عملية
    setTimeout(() => {
        perfMonitor.end('page-load');
        perfMonitor.printReport();
    }, 2000);
}

// ============================================================================
// 9️⃣ تهيئة عند تحميل الصفحة
// ============================================================================

// تفعيل Lazy Loading عند تحميل الـ DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Performance optimizations loaded');

    // تفعيل lazy loading
    initLazyLoading();

    // بدء مراقبة الأداء
    perfMonitor.start('dom-ready');
});

// حفظ الدوال العام للاستخدام
window.APICache = APICache;
window.apiCache = apiCache;
window.cachedFetch = cachedFetch;
window.debounce = debounce;
window.throttle = throttle;
window.PerformanceMonitor = PerformanceMonitor;
window.perfMonitor = perfMonitor;
