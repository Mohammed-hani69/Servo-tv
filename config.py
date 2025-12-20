"""
إعدادات التطبيق
"""
import os

# بيئة التطبيق
DEBUG = os.getenv('FLASK_ENV') == 'development'
TESTING = os.getenv('FLASK_ENV') == 'testing'

# إعدادات قاعدة البيانات
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = False  # تعيين True لمراقبة عمليات SQL
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///instance/database.db')

# المفتاح السري
SECRET_KEY = os.getenv('SECRET_KEY', 'j4rt6y5tj46fds15f7wer8t79r8y2t1j20n21gre8')

# إعدادات الجلسة
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_LIFETIME = 86400  # يوم واحد بالثواني

# إعدادات أخرى
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # الحد الأقصى لحجم الملف المرفوع (16MB)
JSON_SORT_KEYS = False

# إعدادات التسجيل
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
