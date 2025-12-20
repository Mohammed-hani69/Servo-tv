"""
المسارات الخاصة بالمستخدمين العاديين
"""
from functools import wraps
from flask import Blueprint, redirect, render_template, jsonify, request, session, url_for
from models import db, Device, DeviceActivationCode, ActivationCode, User
from datetime import datetime, timedelta
import string
import random
import secrets
from audit_helper import log_user_action

#=============================================================
#=============================================================

users_bp = Blueprint('users', __name__)

def generate_device_id():
    """توليد معرف جهاز فريد بصيغة DEV-XXXXXX"""
    chars = string.ascii_letters + string.digits
    random_part = ''.join(random.choices(chars, k=8))
    return f"DEV-{random_part}"

def generate_activation_code():
    """توليد كود تفعيل 6 أرقام"""
    return ''.join(random.choices(string.digits, k=6))


def user_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'device_uid' not in session:
            return redirect(url_for('users.login'))
        return f(*args, **kwargs)
    return decorated_function
#================================================================
#================================================================
#================================================================

@users_bp.route('/api/device/register', methods=['POST'])
def register_device():
    """
    المرحلة 2: تسجيل جهاز جديد وإنشاء كود تفعيل
    
    1. محاولة استخدام معرف الجهاز الحقيقي (Samsung DUID / LG Serial / Roku UUID)
    2. إذا لم يتوفر، توليد معرف عشوائي
    3. التحقق من وجود كود نشط - إعادته أو توليد جديد
    4. حفظ في device_activation_codes
    """
    try:
        data = request.get_json()
        device_type = data.get('device_type', 'unknown')
        actual_device_id = data.get('actual_device_id', None)  # معرف الجهاز الفعلي
        device_id_source = data.get('device_id_source', 'fallback')  # مصدر المعرف
        
        # 1️⃣ تحديد معرف الجهاز
        if actual_device_id:
            # استخدام معرف الجهاز الحقيقي من الجهاز أو Device Fingerprint
            device_id = actual_device_id
            
            # تحديد ما إذا كان معرفاً حقيقياً أم Fingerprint
            if device_id_source == 'fingerprint':
                print(f"📍 استخدام Device Fingerprint: {device_id}")
            else:
                print(f"✅ استخدام معرف حقيقي ({device_id_source}): {device_id}")
        else:
            # في حالة نادرة - توليد معرف عشوائي
            device_id = generate_device_id()
            device_id_source = 'generated'
            print(f"⚠️ توليد معرف عشوائي: {device_id}")
        
        now = datetime.utcnow()
        
        # 2️⃣ التحقق من وجود كود تفعيل نشط (لم تنته صلاحيته)
        existing_activation = DeviceActivationCode.query.filter_by(
            device_id=device_id,
            is_used=False
        ).filter(
            DeviceActivationCode.expires_at > now
        ).first()
        
        if existing_activation:
            # إعادة الكود الموجود إذا لم تنته صلاحيته
            print(f"♻️ إعادة كود موجود للجهاز: {device_id}")
            return jsonify({
                'success': True,
                'activation_code': existing_activation.activation_code,
                'device_id': device_id,
                'device_id_source': existing_activation.device_type or device_id_source,
                'expires_at': existing_activation.expires_at.isoformat(),
                'expires_in_seconds': int((existing_activation.expires_at - now).total_seconds())
            }), 200
        
        # 3️⃣ إذا انتهت صلاحية الكود أو لم يكن موجوداً - توليد كود جديد
        activation_code = generate_activation_code()
        expires_at = now + timedelta(minutes=10)
        
        # 4️⃣ حفظ البيانات في جدول device_activation_codes
        device_activation = DeviceActivationCode(
            activation_code=activation_code,
            device_id=device_id,
            device_type=device_type,
            is_used=False,
            expires_at=expires_at
        )
        
        db.session.add(device_activation)
        db.session.commit()
        
        print(f"✨ تم إنشاء كود تفعيل جديد للجهاز {device_id}")
        
        # 5️⃣ إرجاع الكود مع البيانات
        return jsonify({
            'success': True,
            'activation_code': activation_code,
            'device_id': device_id,
            'device_id_source': device_id_source,
            'expires_at': expires_at.isoformat(),
            'expires_in_seconds': 600
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ خطأ في تسجيل الجهاز: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@users_bp.route('/login')
def login():
    device_uid = request.cookies.get('device_uid')

    if not device_uid:
        return render_template(
            'user/login.html',
            error="لم يتم التعرف على الجهاز"
        )

    device = Device.query.filter_by(
        device_uid=device_uid,
        is_active=True,
        is_deleted=False
    ).first()

    if not device:
        return render_template(
            'user/login.html',
            error="الجهاز غير مفعل"
        )

    # 🔐 تفعيل Session بالجهاز
    session.clear()
    session['device_id'] = device.id
    session['device_uid'] = device.device_uid

    from datetime import datetime
    now = datetime.utcnow()
    device.last_login_at = now
    device.last_ip = request.remote_addr
    db.session.commit()
    
    # تسجيل عملية الدخول
    if device.user_id:
        log_user_action(
            user_id=device.user_id,
            action='login',
            description=f'User logged in on device {device.device_uid}',
            resource_type='device',
            resource_id=device.id
        )

    return redirect(url_for('users.dashboard'))


@users_bp.route('/logout')
def logout():
    device_id = session.get('device_id')
    user_id = None
    if device_id:
        device = Device.query.get(device_id)
        if device:
            user_id = device.user_id
    
    if user_id:
        log_user_action(
            user_id=user_id,
            action='logout',
            description='User logged out',
            resource_type='device',
            resource_id=device_id
        )
    
    session.clear()
    return redirect(url_for('users.login'))



#================================================================
# صفحات المستخدم العادي
#================================================================

@users_bp.route('/dashboard')
@user_login_required
def dashboard():
    """صفحة لوحة تحكم المستخدم"""
    device_uid = session.get('device_uid')
    device = Device.query.filter_by(device_uid=device_uid).first()

    return render_template('user/dashboard.html', device=device)

@users_bp.route('/player')
@user_login_required
def player():
    """صفحة مشغل الفيديو"""
    return render_template('user/player.html')

@users_bp.route('/profile')
@user_login_required
def profile():
    """صفحة ملف المستخدم"""
    return render_template('user/profile.html')

@users_bp.route('/series')
@user_login_required
def series():
    """صفحة سلسلة البرامج"""
    return render_template('user/series.html')


@users_bp.route('/movies')
@user_login_required
def movies():
    """صفحة الأفلام"""
    return render_template('user/movies.html')

@users_bp.route('/live-tv')
@user_login_required
def live_tv():
    """صفحة البث المباشر"""
    return render_template('user/live-tv.html')

@users_bp.route('/settings')
@user_login_required
def settings():
    """صفحة إعدادات المستخدم"""
    return render_template('user/settings.html')


@users_bp.route('/my-list', methods=['GET'])
@user_login_required
def my_list():
    """الحصول على أجهزة المستخدم"""
    return render_template('user/playlist.html')






# ============================================================================
# 🟢 المرحلة 9: الجهاز يبدأ العمل - Device Login
# ============================================================================

@users_bp.route('/api/device/login', methods=['POST'])
def device_login():
    """
    🟢 المرحلة 9: الجهاز يبدأ العمل
    
    13️⃣ الجهاز يعمل Poll أو Login
    14️⃣ Backend يتحقق:
        - الجهاز مرتبط بمستخدم
        - الاشتراك ساري
        - عدم تجاوز max_devices
    15️⃣ يرجع: token, media_link, subscription info
    
    متطلبات الطلب:
    - device_id: معرف الجهاز الفريد
    """
    
    try:
        data = request.get_json()
        device_id = data.get('device_id', '').strip()
        
        if not device_id:
            return jsonify({
                'success': False,
                'message': 'Device ID is required'
            }), 400
        
        # ============================================================================
        # 1️⃣ البحث عن جهاز في جدول devices
        # ============================================================================
        
        device = Device.query.filter_by(
            device_uid=device_id,
            is_active=True
        ).first()
        
        if not device:
            return jsonify({
                'success': False,
                'message': 'Device has not been activated yet'
            }), 403
        
        # ============================================================================
        # 2️⃣ الحصول على معرف المستخدم المرتبط
        # ============================================================================
        
        user_id = device.user_id
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'User information not found'
            }), 404
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # ============================================================================
        # 3️⃣ البحث عن كود التفعيل في device_activation_codes
        # ============================================================================
        
        device_activation_code = DeviceActivationCode.query.filter_by(
            device_id=device_id,
            is_used=True
        ).first()
        
        if not device_activation_code:
            return jsonify({
                'success': False,
                'message': 'Device activation record not found'
            }), 403
        
        # ============================================================================
        # 4️⃣ التحقق من الاشتراك (من جدول activation_codes)
        # ============================================================================
        
        activation_code = ActivationCode.query.filter_by(
            assigned_user_id=user_id
        ).first()
        
        if not activation_code:
            return jsonify({
                'success': False,
                'message': 'No active subscription found'
            }), 403
        
        # ============================================================================
        # 5️⃣ التحقق من صلاحية الاشتراك
        # ============================================================================
        
        now = datetime.utcnow()
        
        if activation_code.expiration_date and activation_code.expiration_date < now:
            return jsonify({
                'success': False,
                'message': 'Subscription has expired'
            }), 403
        
        # ============================================================================
        # 6️⃣ التحقق من عدم تجاوز max_devices
        # ============================================================================
        
        active_devices_count = Device.query.filter_by(
            user_id=user_id,
            is_active=True
        ).count()
        
        if active_devices_count > activation_code.max_devices:
            return jsonify({
                'success': False,
                'message': f'Maximum number of devices ({activation_code.max_devices}) exceeded'
            }), 403
        
        # ============================================================================
        # 7️⃣ توليد token جديد للجهاز (جلسة عمل)
        # ============================================================================
        
        # تعيين الجلسة للجهاز
        session.clear()
        session['device_uid'] = device.device_uid
        session['user_id'] = user_id
        session['username'] = user.username
        
        # يمكن استخدام JWT أو توليد token بسيط
        session_token = secrets.token_urlsafe(32)
        
        # تحديث آخر تسجيل دخول للجهاز
        device.last_login_at = now
        device.last_ip = request.remote_addr
        db.session.commit()
        
        # ============================================================================
        # 8️⃣ إرجاع البيانات
        # ============================================================================
        
        return jsonify({
            'success': True,
            'message': 'Device login successful',
            'data': {
                'token': session_token,
                'user_id': user_id,
                'username': user.username,
                'device_id': device.device_uid,
                'media_link': device.media_link,
                'subscription': {
                    'duration_months': activation_code.duration_months,
                    'max_devices': activation_code.max_devices,
                    'activated_at': activation_code.activated_at.isoformat(),
                    'expiration_date': activation_code.expiration_date.isoformat(),
                    'days_remaining': (activation_code.expiration_date - now).days
                },
                'device_info': {
                    'device_type': device.device_type,
                    'first_login_at': device.first_login_at.isoformat() if device.first_login_at else None,
                    'is_active': device.is_active
                }
            }
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في device login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500
