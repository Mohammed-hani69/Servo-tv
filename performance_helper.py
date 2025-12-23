"""
تحسينات الأداء والـ Caching للموقع
مشاكل محددة:
1. N+1 Queries من تحميل البيانات المرتبطة بدون eager loading
2. استعلامات متكررة لنفس البيانات
3. تحميل كميات كبيرة من البيانات غير الضرورية
"""

from functools import wraps
from flask import session
from models import db, Device, ActivationCode, User
from datetime import datetime, timedelta, timezone
import hashlib

# ============================================================================
# 1️⃣ Caching مع Session (بدل Redis في البداية)
# ============================================================================

class SessionCache:
    """كاش بسيط يعتمد على Flask Session"""
    
    CACHE_KEY_PREFIX = 'cache_'
    CACHE_DURATION = 300  # 5 دقائق
    
    @staticmethod
    def get(key):
        """جلب من الكاش"""
        cache_key = f"{SessionCache.CACHE_KEY_PREFIX}{key}"
        cached_data = session.get(cache_key)
        
        if cached_data and cached_data.get('expires_at') > datetime.utcnow():
            return cached_data.get('data')
        
        # حذف البيانات المنتهية
        if cache_key in session:
            del session[cache_key]
        
        return None
    
    @staticmethod
    def set(key, value, duration=CACHE_DURATION):
        """حفظ في الكاش"""
        cache_key = f"{SessionCache.CACHE_KEY_PREFIX}{key}"
        session[cache_key] = {
            'data': value,
            'expires_at': datetime.utcnow() + timedelta(seconds=duration)
        }
        session.modified = True
    
    @staticmethod
    def delete(key):
        """حذف من الكاش"""
        cache_key = f"{SessionCache.CACHE_KEY_PREFIX}{key}"
        if cache_key in session:
            del session[cache_key]
            session.modified = True


# ============================================================================
# 2️⃣ Optimized Database Queries
# ============================================================================

def get_device_with_user(device_uid, is_active=True):
    """
    جلب الجهاز مع بيانات المستخدم مباشرة (Eager Loading)
    
    ❌ الطريقة القديمة:
    device = Device.query.filter_by(device_uid=device_uid).first()  # Query 1
    user = User.query.get(device.user_id)  # Query 2 (N+1)
    
    ✅ الطريقة الجديدة:
    device = Device.query.options(joinedload(Device.user)).filter_by(...).first()  # Query 1 فقط
    """
    from sqlalchemy.orm import joinedload
    
    if is_active:
        return Device.query.options(joinedload(Device.user)).filter_by(
            device_uid=device_uid, is_active=True
        ).first()
    else:
        return Device.query.options(joinedload(Device.user)).filter_by(
            device_uid=device_uid
        ).first()


def get_device_with_activation(device_uid, is_active=True):
    """
    جلب الجهاز مع بيانات المستخدم والاشتراك (Eager Loading)
    
    ✅ Query واحد فقط بدل 3
    """
    from sqlalchemy.orm import joinedload
    
    if is_active:
        return Device.query.options(
            joinedload(Device.user).joinedload(User.activation_codes)
        ).filter(
            Device.device_uid == device_uid,
            Device.is_active == True
        ).first()
    else:
        return Device.query.options(
            joinedload(Device.user).joinedload(User.activation_codes)
        ).filter(
            Device.device_uid == device_uid
        ).first()


def get_activation_for_user(user_id):
    """جلب آخر اشتراك نشط للمستخدم"""
    return ActivationCode.query.filter_by(
        assigned_user_id=user_id
    ).order_by(ActivationCode.created_at.desc()).first()


def get_user_devices_paginated(user_id, page=1, per_page=20):
    """
    جلب أجهزة المستخدم مع Pagination
    
    ❌ الطريقة القديمة:
    devices = Device.query.filter_by(user_id=user_id).all()  # قد تكون 10,000 جهاز!
    
    ✅ الطريقة الجديدة:
    devices = Device.query.filter_by(user_id=user_id).paginate(page, per_page)
    """
    return Device.query.filter_by(
        user_id=user_id,
        is_deleted=False
    ).paginate(page=page, per_page=per_page, error_out=False)


def get_reseller_users_paginated(reseller_id, page=1, per_page=50):
    """جلب مستخدمي الموزع مع Pagination"""
    return User.query.filter_by(
        reseller_id=reseller_id
    ).paginate(page=page, per_page=per_page, error_out=False)


def get_reseller_devices_paginated(reseller_id, page=1, per_page=50):
    """
    جلب أجهزة جميع مستخدمي الموزع مع Pagination
    
    ❌ الطريقة القديمة (في reseller.py):
    users = User.query.filter_by(reseller_id=reseller_id).all()  # 1000 صف
    for user in users:
        devices = Device.query.filter_by(user_id=user.id).all()  # 1000 query!
        for device in devices:
            code = ActivationCode.query.filter_by(...).first()  # 10,000 query!
    # المجموع: 11,000+ query! 🔥
    
    ✅ الطريقة الجديدة:
    - استخدام JOIN بدل N+1 queries
    - Eager loading لكل البيانات المرتبطة
    - Pagination بدل جلب الكل
    """
    from sqlalchemy.orm import joinedload
    
    # جلب المستخدمين أولاً
    users = User.query.filter_by(
        reseller_id=reseller_id
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    # بدل جلب الأجهزة في حلقة، نستخدم Query واحد
    user_ids = [u.id for u in users.items]
    
    devices = Device.query.filter(
        Device.user_id.in_(user_ids),
        Device.is_deleted == False
    ).options(
        joinedload(Device.user)  # تحميل بيانات المستخدم مباشرة
    ).all()
    
    return users, devices


# ============================================================================
# 3️⃣ Decorator للـ Performance Monitoring
# ============================================================================

def monitor_performance(f):
    """
    Decorator لرصد بطء الـ routes
    طبع الوقت المستغرق والـ SQL queries
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        import time
        from flask import current_app
        
        start_time = time.time()
        
        try:
            result = f(*args, **kwargs)
            elapsed = time.time() - start_time
            
            # طبع التحذير إذا كان بطيء (أكثر من 1 ثانية)
            if elapsed > 1.0:
                print(f"⚠️ SLOW ROUTE: {f.__name__} took {elapsed:.2f}s")
            
            return result
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"❌ ERROR in {f.__name__} ({elapsed:.2f}s): {str(e)}")
            raise
    
    return decorated_function


# ============================================================================
# 4️⃣ Batch Loading (لتقليل عدد الـ Queries)
# ============================================================================

def get_users_activation_codes_batch(user_ids):
    """
    جلب أكواد التفعيل لمجموعة من المستخدمين دفعة واحدة
    
    ❌ الطريقة القديمة:
    for user_id in user_ids:
        code = ActivationCode.query.filter_by(assigned_user_id=user_id).first()
    # عدد الـ queries = عدد المستخدمين
    
    ✅ الطريقة الجديدة:
    codes = ActivationCode.query.filter(
        ActivationCode.assigned_user_id.in_(user_ids)
    ).all()
    # عدد الـ queries = 1
    """
    if not user_ids:
        return {}
    
    codes = ActivationCode.query.filter(
        ActivationCode.assigned_user_id.in_(user_ids)
    ).all()
    
    # تنظيم النتائج بحسب user_id
    result = {}
    for code in codes:
        if code.assigned_user_id not in result:
            result[code.assigned_user_id] = code
    
    return result


def get_devices_batch(user_ids):
    """جلب أجهزة مجموعة من المستخدمين دفعة واحدة"""
    if not user_ids:
        return {}
    
    devices = Device.query.filter(
        Device.user_id.in_(user_ids),
        Device.is_deleted == False
    ).all()
    
    # تنظيم النتائج بحسب user_id
    result = {}
    for device in devices:
        if device.user_id not in result:
            result[device.user_id] = []
        result[device.user_id].append(device)
    
    return result


# ============================================================================
# 5️⃣ Query بناء ديناميكي مع Filters
# ============================================================================

def build_device_query(filters=None):
    """
    بناء استعلام الأجهزة ديناميكياً حسب الـ Filters
    
    filters = {
        'user_id': 123,
        'is_active': True,
        'device_type': 'mobile',
        'search': 'Samsung',
        'page': 1,
        'per_page': 50
    }
    """
    from sqlalchemy.orm import joinedload
    
    query = Device.query.options(joinedload(Device.user))
    
    if filters is None:
        filters = {}
    
    # تطبيق الـ Filters
    if filters.get('user_id'):
        query = query.filter_by(user_id=filters['user_id'])
    
    if 'is_active' in filters:
        query = query.filter_by(is_active=filters['is_active'])
    
    if filters.get('device_type'):
        query = query.filter_by(device_type=filters['device_type'])
    
    if filters.get('search'):
        search = f"%{filters['search']}%"
        query = query.filter(
            db.or_(
                Device.device_name.ilike(search),
                Device.device_uid.ilike(search)
            )
        )
    
    # Pagination
    page = filters.get('page', 1)
    per_page = filters.get('per_page', 50)
    
    return query.paginate(page=page, per_page=per_page, error_out=False)


# ============================================================================
# 6️⃣ Response Serialization (تسريع JSON response)
# ============================================================================

def serialize_device(device, include_user=True):
    """تحويل الجهاز إلى dict بسيط"""
    data = {
        'id': device.id,
        'device_uid': device.device_uid,
        'device_name': device.device_name,
        'device_type': device.device_type,
        'is_active': device.is_active,
        'last_login_at': device.last_login_at.isoformat() if device.last_login_at else None,
        'last_ip': device.last_ip
    }
    
    if include_user and device.user:
        data['user'] = {
            'id': device.user.id,
            'username': device.user.username
        }
    
    return data


def serialize_activation_code(code):
    """تحويل كود التفعيل إلى dict"""
    return {
        'id': code.id,
        'code': code.code,
        'duration_months': code.duration_months,
        'max_devices': code.max_devices,
        'is_active': not (code.expiration_date and code.expiration_date < datetime.utcnow()),
        'expiration_date': code.expiration_date.isoformat() if code.expiration_date else None
    }
