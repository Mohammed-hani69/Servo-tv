#!/usr/bin/env python
"""حذف قاعدة البيانات وإعادة إنشاؤها"""

import os
import time
import shutil

db_path = r'd:\SERVO-TV\instance\database.db'

# محاولة حذف الملف عدة مرات
for attempt in range(5):
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✅ تم حذف قاعدة البيانات في المحاولة {attempt + 1}")
            break
    except PermissionError:
        print(f"⏳ محاولة {attempt + 1}/5: انتظار إغلاق الملف...")
        time.sleep(1)
else:
    print("❌ لم يتمكن من حذف الملف بعد محاولات متعددة")
    exit(1)

# الآن تشغيل init_db
print("\n🔄 بدء تهيئة قاعدة البيانات الجديدة...")
os.system('python init_db.py')
