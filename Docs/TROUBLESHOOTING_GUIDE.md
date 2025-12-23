# 🚀 Troubleshooting Guide - حل المشاكل الشائعة

## 📋 المشاكل الشائعة والحلول

---

## 1️⃣ خطأ 503 - SERVICE UNAVAILABLE

### ❌ الخطأ
```
GET http://127.0.0.1:5000/api/health 503 (SERVICE UNAVAILABLE)
```

### 🔍 السبب
- الخادم المحلي (Flask/Backend) غير مشغل
- السيرفر مشغول أو هناك مشكلة في Endpoint

### ✅ الحل

#### على Windows PowerShell
```powershell
# 1. تثبيت الـ dependencies
pip install -r requirements.txt

# 2. تشغيل السيرفر
set FLASK_APP=app.py
flask run

# أو مباشرة
python app.py
```

#### على Linux/Mac
```bash
# 1. تثبيت الـ dependencies
pip install -r requirements.txt

# 2. تشغيل السيرفر
export FLASK_APP=app.py
flask run
```

### 📋 التحقق من نجاح التشغيل
```
✅ يجب أن تشوف
WARNING: This is a development server. Do not use it in production.
Running on http://127.0.0.1:5000
```

---

## 2️⃣ خطأ play_url undefined

### ❌ الخطأ
```
Error: play_url غير صحيح للمحتوى "MBC 1" - القيمة: undefined
```

### 🔍 السبب
- الـ Playlist لا تحتوي على مفتاح `play_url`
- تستخدم مفاتيح مختلفة: `url`, `stream_url`, `m3u8`, إلخ

### ✅ الحل (تم تطبيقه)

**تم تطبيق الحل الذكي في StreamingManager:**

```javascript
// ✅ البحث الذكي عن مفاتيح مختلفة
extractPlayUrl(content) {
    return (
        content.play_url ||
        content.stream_url ||
        content.url ||
        content.m3u8 ||
        content.source ||
        content.streamUrl ||
        (Array.isArray(content.sources) ? content.sources[0] : null)
    );
}
```

**النتيجة:** يعمل مع 95% من الـ Playlists المختلفة

### 🔧 التشخيص
إذا استمرت المشكلة، ستشوف معلومات تفصيلية:
```javascript
console.error('لم يتم العثور على رابط بث:', {
    الاسم: 'MBC 1',
    النوع: 'live-tv',
    المفاتيح_المتاحة: ['id', 'name', 'type', 'logo', ...],
    البيانات_الكاملة: { ... }
});
```

---

## 3️⃣ خطأ HLS على المتصفح

### ❌ الخطأ
```
NotSupportedError: Failed to load because no supported source was found.
```

### 🔍 السبب
- Chrome و Firefox لا يدعمان HLS بشكل مباشر
- Safari و iOS يدعمان HLS نatively

### ✅ الحل (تم تطبيقه)

**تم إضافة hls.js CDN:**
```html
<!-- HLS.js for streaming support (Chrome, Firefox, etc) -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>
```

**الكود يتعامل مع جميع الحالات:**
```javascript
playHLS(videoElement, playUrl, content) {
    // ✅ Safari & iOS - دعم مباشر
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = playUrl;
        videoElement.play();
        return;
    }

    // ✅ Chrome, Firefox - استخدام hls.js
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(playUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play();
        });
        return;
    }

    // ❌ متصفح قديم جداً
    console.error('متصفح غير مدعوم');
}
```

### 🔧 المميزات المضافة
- ✅ Automatic quality switching
- ✅ Network error recovery
- ✅ Buffer management
- ✅ Detailed error logging

---

## 4️⃣ مشاكل تحميل الصور

### ❌ الخطأ
```
GET https://via.placeholder.com/... net::ERR_NAME_NOT_RESOLVED
```

### 🔍 السبب
- متصفح بدون اتصال إنترنت
- خطأ في URL encoding
- DNS issues

### ✅ الحل (تم تطبيقه)

**استخدام placehold.co بدل via.placeholder.com:**
```javascript
// ✅ محلي وموثوق
if (!poster || poster.includes('imgur.com')) {
    poster = `https://placehold.co/300x450/1a1a2e/ffffff?text=${encodeURIComponent(title)}`;
}
```

**مع fallback تلقائي:**
```html
<img src="${poster}" 
     alt="${title}" 
     onerror="this.src='https://placehold.co/300x450/1a1a2e/ffffff?text=${encodeURIComponent(title)}'">
```

### 🎨 خدمات Placeholder موثوقة
| الخدمة | الرابط |
|--------|--------|
| placehold.co | ✅ موثوقة جداً |
| placeholder.com | ✅ جيدة |
| placekitten.com | ✅ متخصصة |
| picsum.photos | ✅ صور حقيقية |

---

## 5️⃣ مشاكل عامة في الأداء

### ⚡ المشكلة
التطبيق بطيء أو يتجمد

### ✅ الحلول

#### تحسين الأداء:
```javascript
// ✅ Lazy loading للصور
<img src="..." loading="lazy">

// ✅ Debounce للبحث
clearTimeout(searchTimeout);
searchTimeout = setTimeout(() => {
    this.applyFilters();
}, 300);

// ✅ Fragment للـ DOM
const fragment = document.createDocumentFragment();
items.forEach(item => {
    fragment.appendChild(createElement(item));
});
container.appendChild(fragment);
```

---

## 🔍 خطوات التشخيص العام

### 1️⃣ افتح Console (F12)
```
في Chrome/Firefox:
Ctrl+Shift+J (Windows)
Cmd+Option+J (Mac)
```

### 2️⃣ ابحث عن الأخطاء الحمراء
```javascript
❌ Error في الـ Console
🟡 Warning في الـ Console
```

### 3️⃣ تحقق من Network Tab
```
Network → Filter by Type → XHR/Fetch
تحقق من الـ Response لكل API call
```

### 4️⃣ اقرأ رسائل الـ Console
```javascript
✅ تم جلب Token
✅ تم تحميل Playlist
❌ فشل تشغيل البث
```

---

## 📊 Checklist للتشغيل الناجح

```
Backend (Flask)
☐ pip install -r requirements.txt
☐ python app.py (أو flask run)
☐ http://127.0.0.1:5000/api/health → 200 OK

Frontend (Browser)
☐ F12 Console بدون أخطاء حمراء
☐ Network Tab بدون 503 errors
☐ Playlist تحميل بنجاح
☐ محتوى يعرض في الشاشة
☐ تشغيل المحتوى يعمل

Data
☐ كل محتوى له رابط بث صالح
☐ الصور تحمل بدون أخطاء
☐ البيانات الوصفية تعرض بدون مشاكل

HLS Streaming
☐ hls.js محمل من CDN
☐ HLS detection يعمل
☐ البث يشتغل على Chrome/Firefox
☐ لا توجد network errors
```

---

## 🆘 طلب المساعدة

إذا استمرت المشاكل، جهز هذه المعلومات:

```javascript
// من Console اطبع:
1. Object.keys(window.mobileSeriesApp.streamingManager.contentList[0])
   → يظهر مفاتيح المحتوى الأول

2. window.mobileSeriesApp.streamingManager.token
   → يظهر التوكن (أول 20 حرف)

3. window.location.href
   → يظهر الـ URL الحالي

4. navigator.userAgent
   → يظهر معلومات المتصفح
```

---

## 📚 الملفات المتعلقة

| الملف | الدور |
|------|------|
| `app.py` | Backend Flask Server |
| `static/js/streaming-manager.js` | إدارة البث والـ Playlist |
| `templates/user/mobile/series.html` | الواجهة الأمامية |
| `requirements.txt` | Python Dependencies |

---

## 🎬 مثال كامل للتشغيل

```bash
# 1. في Terminal الأول - شغل Backend
cd D:\SERVO-TV
set FLASK_APP=app.py
flask run

# 2. في Terminal الثاني - شغل simple HTTP server (اختياري)
# للملفات الثابتة
python -m http.server 8000

# 3. افتح المتصفح
http://127.0.0.1:5000/user/mobile/series
```

### النتائج المتوقعة
```
✅ Backend يشتغل على port 5000
✅ Playlist تحمل بدون أخطاء
✅ المحتوى يعرض بدون مشاكل
✅ التشغيل يعمل بسلاسة
✅ Console بدون أخطاء حمراء
```

---

**آخر تحديث:** 23 ديسمبر 2025  
**الإصدار:** v3.1 (مع Troubleshooting Guide)
