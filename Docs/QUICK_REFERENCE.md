# ⚡ Quick Reference - مرجع سريع

## 🚀 البدء السريع

### تشغيل التطبيق
```bash
# 1. افتح Terminal في مجلد SERVO-TV
cd d:\SERVO-TV

# 2. شغل Flask
python app.py

# 3. افتح المتصفح
http://127.0.0.1:5000/user/mobile
```

### التحقق من المشاكل
```
اضغط F12 → Console Tab → الصق أحد الأوامر أدناه
```

---

## 🔍 أوامر Console السريعة

### معلومات عامة
```javascript
// عدد المحتوى المحمل
StreamingManager.contentList.length

// اسم المحتوى الأول
StreamingManager.contentList[0].name

// جميع الفئات
StreamingManager.getUniqueGroups()

// بحث سريع
StreamingManager.searchContent('MBC')
```

### فحص الروابط
```javascript
// الرابط الأول
const item = StreamingManager.contentList[0];
const url = StreamingManager.extractPlayUrl(item);

// فحص صحة الرابط
await StreamingManager.validateStreamUrl(url);

// تشخيص مفصل
await StreamingManager.diagnoseStreamUrl(url);
```

### معلومات الفيديو
```javascript
// حالة البث
const video = document.getElementById('video-player');
console.log({
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
    buffered: (video.buffered.end(0) / video.duration * 100).toFixed(1) + '%'
});

// معلومات HLS
const hls = StreamingManager.currentHls;
console.log({
    levels: hls.levels.length,
    currentLevel: hls.currentLevel,
    bitrate: hls.levels[hls.currentLevel]?.bitrate
});
```

---

## ❌ حل الأخطاء السريع

### خطأ: play_url undefined
```javascript
// ✅ المشكلة حلت مع extractPlayUrl()
// لا يوجد شيء تفعله - الكود يتعامل معها تلقائياً
```

### خطأ: NotSupportedError
```javascript
// ✅ تحقق من دعم HLS
Hls.isSupported()  // يجب true

// إذا كانت false، المتصفح قديم جداً
```

### خطأ: 404 levelLoadError
```javascript
// ✅ هذا طبيعي - جودة محددة غير موجودة
// البث يستمر بجودة أخرى
// لا يوجد شيء تفعله

// تحقق من المستويات المتاحة:
console.table(StreamingManager.currentHls?.levels);
```

### خطأ: CORS
```javascript
// ✅ تم الحل في xhrSetup config
// لا يوجد شيء تفعله

// إذا استمرت، قد تحتاج البيانات المرسلة تحديث
```

### خطأ: 503 Service Unavailable
```javascript
// ❌ Flask backend غير مشغل

// ✅ الحل:
# في Terminal
python app.py
```

### البث متوقف/معطل
```javascript
// ✅ مراقبة الصحة ستحاول الاستعادة تلقائياً

// يمكنك محاولة يدوياً:
StreamingManager.currentHls?.startLoad();
```

---

## 📊 جداول سريعة

### عرض جميع المحتوى
```javascript
console.table(StreamingManager.contentList);
```

### المحتوى حسب النوع
```javascript
console.table(StreamingManager.getContentByType('series'));
console.table(StreamingManager.getContentByType('tv'));
```

### المحتوى حسب الفئة
```javascript
console.table(StreamingManager.getContentByGroup('عربي'));
console.table(StreamingManager.getContentByGroup('أخبار'));
```

### نتائج البحث
```javascript
console.table(StreamingManager.searchContent('MBC'));
```

---

## 🎬 أوامر التشغيل

### تشغيل عنصر
```javascript
// تشغيل المحتوى الأول
const item = StreamingManager.contentList[0];
StreamingManager.playContent(item);
```

### إيقاف/استئناف
```javascript
// إيقاف
document.getElementById('video-player').pause();

// استئناف
document.getElementById('video-player').play();

// إيقاف كامل
document.getElementById('videoPlayerModal').style.display = 'none';
```

### تغيير الجودة
```javascript
// الجودة التالية
StreamingManager.currentHls?.nextLevel += 1;

// الجودة الأفضل
StreamingManager.currentHls?.nextLevel = 0;

// الجودة الأسوأ
const hls = StreamingManager.currentHls;
hls.nextLevel = hls.levels.length - 1;
```

---

## 📈 رصد الأداء

### سرعة الإنترنت
```javascript
const hls = StreamingManager.currentHls;
const level = hls.levels[hls.currentLevel];
console.log(`الـ Bitrate: ${(level.bitrate / 1000000).toFixed(1)} Mbps`);
```

### حالة التخزين المؤقت
```javascript
const video = document.getElementById('video-player');
const buffered = video.buffered.end(0);
const duration = video.duration;
console.log(`Buffer: ${(buffered / duration * 100).toFixed(1)}%`);
```

### معلومات الدقة
```javascript
const video = document.getElementById('video-player');
console.log(`${video.videoWidth}x${video.videoHeight}`);
```

---

## 🛠️ أدوات التطوير

### تفعيل Debug Mode
```javascript
// إضافة معلومات تفصيلية
localStorage.setItem('debugMode', 'true');
location.reload();
```

### عرض جميع الأحداث HLS
```javascript
const hls = StreamingManager.currentHls;
Object.keys(Hls.Events).forEach(eventName => {
    hls.on(eventName, (event, data) => {
        console.log(`📡 HLS Event: ${eventName}`, data);
    });
});
```

### مسح الـ Cache
```javascript
// مسح localStorage
localStorage.clear();

// مسح sessionStorage
sessionStorage.clear();

// إعادة تحميل
location.reload();
```

---

## ⚙️ الإعدادات المهمة

### في streaming-manager.js
```javascript
// يمكنك تعديل هذه الثوابت:

const HLS_CONFIG = {
    enableWorker: true,              // استخدام Web Worker
    fragLoadingTimeOut: 60000,       // timeout لتحميل القطعة
    manifestLoadingTimeOut: 30000,   // timeout للـ manifest
    levelLoadingTimeOut: 30000,      // timeout لقائمة الجودة
    maxLoadingDelay: 4,              // أقصى تأخير
    minAutoBitrate: 0                // الحد الأدنى للـ bitrate التلقائي
};

// HEALTH_MONITOR_INTERVAL = 1000  // كل ثانية
// STALL_THRESHOLD = 3              // عدد مرات التوقف قبل استعادة
```

---

## 💡 نصائح مفيدة

### 1. احفظ رسائل Console
```
Console Settings (⚙️) → Preserve log ✓
```

### 2. فلتر الرسائل
```
ابحث في Console عن:
✅  (للنجاحات)
❌  (للأخطاء)
⚠️  (للتحذيرات)
```

### 3. اختبر قبل البث
```javascript
// دائماً افحص الرابط أولاً:
await StreamingManager.validateStreamUrl(url);

// ثم تشخيص مفصل إذا فشل:
await StreamingManager.diagnoseStreamUrl(url);
```

### 4. راقب البث الحي
```javascript
// افتح 2 Tabs:
// Tab 1: التطبيق (المشغل)
// Tab 2: Console (المراقبة)

// في Console Tab:
setInterval(() => {
    const video = document.getElementById('video-player');
    console.log(`Buffer: ${(video.buffered.end(0) / video.duration * 100).toFixed(1)}%`);
}, 5000);
```

---

## 🆘 طلب المساعدة

### جمع المعلومات قبل طلب المساعدة:

```javascript
// 1. معلومات عامة
console.log('Browser:', navigator.userAgent);
console.log('Resolution:', window.innerWidth + 'x' + window.innerHeight);

// 2. معلومات التطبيق
console.log('Content Loaded:', StreamingManager.contentList.length);
console.log('HLS Supported:', Hls.isSupported());

// 3. معلومات الخطأ (من Console)
// انسخ الرسالة كاملة

// 4. صورة من الشاشة
// (اضغط Print Screen)

// 5. الرابط الذي يسبب المشكلة
const url = StreamingManager.extractPlayUrl(StreamingManager.contentList[0]);
console.log('URL:', url);
```

---

## 📚 الملفات الموصى بها

| الملف | الموضوع |
|------|--------|
| CONSOLE_DEBUGGING_GUIDE.md | أوامر Console المفصلة |
| STREAM_URL_HANDLING.md | معالجة الروابط المتقدمة |
| TROUBLESHOOTING_GUIDE.md | حل المشاكل الشاملة |
| HLS_PLAYBACK_FIX.md | تفاصيل تقنية HLS |
| SERIES_DETAILS_SCREEN.md | واجهة المسلسلات |
| COMPLETE_STREAMING_IMPLEMENTATION.md | ملخص شامل |

---

**آخر تحديث:** 23 ديسمبر 2025  
**الإصدار:** v1.0
