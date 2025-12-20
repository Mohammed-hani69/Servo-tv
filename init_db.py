"""
ملف تهيئة التطبيق مع بيانات تجريبية
"""
from celery import current_app
from models import db, Reseller, User, Admin

def init_db_with_sample_data(app, db):
    """إضافة بيانات تجريبية إلى قاعدة البيانات"""
    
    with app.app_context():
        # التحقق من وجود بيانات موجودة
        if Admin.query.first() is not None:
            print("✅ قاعدة البيانات تحتوي بالفعل على بيانات")
            return
        
        # إضافة مسؤول تجريبي
        from werkzeug.security import generate_password_hash
        
        admin = Admin(
            username='admin',
            email='admin@servo.com',
            password_hash=generate_password_hash('123456'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ تم إضافة المسؤول التجريبي")
        
        # إضافة موزع تجريبي
        reseller = Reseller(
            name='الموزع الأول',
            email='treno@servo.com',
            password_hash=generate_password_hash('123456'),
            points_balance=1000
        )
        db.session.add(reseller)
        db.session.commit()
        print("✅ تم إضافة الموزع التجريبي")
        
        # إضافة مستخدمين عاديين
        user1 = User(username='user1', reseller_id=reseller.id)
        user2 = User(username='user2', reseller_id=reseller.id)
        db.session.add_all([user1, user2])
        db.session.commit()
        print("✅ تم إضافة المستخدمين التجريبيين")


if __name__ == '__main__':
    # استيراد التطبيق وتهيئة البيانات
    from app import app, db
    
    print("🔄 بدء تهيئة قاعدة البيانات...")
    with app.app_context():
        # إنشاء الجداول
        db.create_all()
        print("✅ تم إنشاء الجداول")
        
        # إضافة البيانات التجريبية
        init_db_with_sample_data(app, db)
    
    print("✅ تم إكمال التهيئة بنجاح!")



