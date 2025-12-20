"""
نقطة دخول التطبيق (WSGI) - للاستخدام مع خوادم الإنتاج
لقد تم دمج المحتوى مع app.py
استخدم: python app.py للتطوير
أو: gunicorn wsgi:app للإنتاج
"""

from app import app, db, socketio

# إذا كنت تريد تشغيل التطبيق من هنا
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
