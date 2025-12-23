"""
المسارات الخاصة بالمستخدمين العاديين
"""
from functools import wraps
from flask import Blueprint, redirect, render_template, jsonify, request, session, url_for
from models import db, Device, DeviceActivationCode, ActivationCode, User
from datetime import datetime, timedelta, timezone
import string
import random
import secrets
from audit_helper import log_user_action
from performance_helper import (
    SessionCache, get_device_with_user, get_device_with_activation,
    get_activation_for_user, monitor_performance, serialize_device
)
from sqlalchemy.orm import joinedload

#=============================================================
#=============================================================



users_bp = Blueprint('users', __name__)


def safe_datetime_compare(dt1, dt2):
    """
    مقارنة آمنة للتواريخ تتعامل مع naive و aware datetimes
    يعود True إذا كان dt1 < dt2 (dt1 قبل dt2)
    """
    if dt1 is None or dt2 is None:
        return False
    
    try:
        # إذا كانت كلاهما naive أو كلاهما aware
        return dt1 < dt2
    except TypeError:
        # إذا كانت واحدة naive والأخرى aware
        # تحويل كلاهما إلى aware
        if dt1.tzinfo is None:
            dt1 = dt1.replace(tzinfo=timezone.utc)
        if dt2.tzinfo is None:
            dt2 = dt2.replace(tzinfo=timezone.utc)
        return dt1 < dt2


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
# 🔍 API Endpoints للفحص والتشخيص
#================================================================

@users_bp.route('/api/session-check', methods=['GET'])
def session_check():
    """التحقق من حالة الجلسة"""
    try:
        device_uid = session.get('device_uid')
        
        if not device_uid:
            return jsonify({
                'authenticated': False,
                'message': 'لا توجد جلسة نشطة'
            }), 401
        
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({
                'authenticated': False,
                'message': 'الجهاز غير نشط'
            }), 403
        
        return jsonify({
            'authenticated': True,
            'device_uid': device_uid,
            'device_name': device.device_name,
            'user_id': device.user_id,
            'is_active': device.is_active
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في فحص الجلسة: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
    

@users_bp.route('/splash')
def splash():
    """صفحة Splash للموبايل"""
    # فقط للأجهزة المحمولة
    if is_mobile_device():
        return render_template('user/mobile/splash.html')
    # إذا كان desktop، انتقل مباشرة إلى login
    return redirect(url_for('users.login'))

@users_bp.route('/login')
def login():
    device_uid = request.cookies.get('device_uid')

    if not device_uid:
        # للموبايل، نتحقق من القادم من splash
        if is_mobile_device():
            template = 'user/mobile/login.html'
        else:
            template = 'user/login.html'
        
        return render_template(
            template,
            error="لم يتم التعرف على الجهاز"
        )

    device = Device.query.filter_by(
        device_uid=device_uid,
        is_active=True,
        is_deleted=False
    ).first()

    if not device:
        if is_mobile_device():
            template = 'user/mobile/login.html'
        else:
            template = 'user/login.html'
        
        return render_template(
            template,
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

def is_mobile_device():
    """
    التحقق من ما إذا كان الطلب من جهاز موبايل
    بناءً على User-Agent
    """
    user_agent = request.headers.get('User-Agent', '').lower()
    
    mobile_keywords = [
        'mobile', 'android', 'iphone', 'ipad', 'ipod',
        'blackberry', 'windows phone', 'kindle', 'opera mini',
        'playstation', 'tablet', 'webos', 'tizen'
    ]
    
    return any(keyword in user_agent for keyword in mobile_keywords)

def get_template_path(template_name):
    """
    الحصول على مسار القالب بناءً على نوع الجهاز
    
    Args:
        template_name: اسم القالب (بدون user/) مثل 'dashboard.html'
    
    Returns:
        المسار الكامل للقالب المناسب
    """
    import os
    
    if is_mobile_device():
        mobile_path = f'user/mobile/{template_name}'
        # تحقق من وجود ملف الموبايل
        if os.path.exists(os.path.join('templates', mobile_path)):
            return mobile_path
        # إذا لم يوجد ملف موبايل، استخدم نسخة سطح المكتب
    
    return f'user/{template_name}'

@users_bp.route('/landing')
def user_landing():
    """صفحة اختيار الدور - الموبايل والويب"""
    template = get_template_path('landing.html')
    return render_template(template)

@users_bp.route('/dashboard')
@user_login_required
@monitor_performance
def dashboard():
    """صفحة لوحة تحكم المستخدم"""
    device_uid = session.get('device_uid')
    
    # استخدام eager loading لجلب البيانات المرتبطة (Query واحد بدل 2+)
    device = get_device_with_user(device_uid, is_active=False)
    
    template = get_template_path('dashboard.html')
    return render_template(template, device=device)

@users_bp.route('/player')
@user_login_required
@monitor_performance
def player():
    """صفحة مشغل الفيديو المتقدمة"""
    try:
        device_uid = session.get('device_uid')
        
        # جلب الجهاز مع كل البيانات المرتبطة في query واحد (بدل 3+ queries)
        device = get_device_with_activation(device_uid, is_active=True)
        
        if not device:
            return redirect(url_for('users.login'))
        
        # التحقق من الاشتراك
        activation = get_activation_for_user(device.user_id)
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            template = get_template_path('player.html')
            return render_template(template, error='Subscription expired')
        
        log_user_action(device.user_id, 'PLAYER_OPENED', 'فتح مشغل الفيديو')
        
        template = get_template_path('player.html')
        return render_template(template, device=device)
    
    except Exception as e:
        print(f"❌ خطأ في صفحة Player: {str(e)}")
        template = get_template_path('player.html')
        return render_template(template, error=str(e))

@users_bp.route('/profile')
@user_login_required
@monitor_performance
def profile():
    """صفحة ملف المستخدم"""
    device_uid = session.get('device_uid')
    device = get_device_with_user(device_uid, is_active=False)
    
    template = get_template_path('profile.html')
    return render_template(template, device=device)


@users_bp.route('/api/profile', methods=['GET'])
@user_login_required
def get_profile():
    """الحصول على بيانات ملف المستخدم"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        user = device.user
        reseller = user.reseller
        
        # الحصول على الاشتراك الحالي للمستخدم
        activation_code = ActivationCode.query.filter_by(assigned_user_id=user.id).first()
        
        # الحصول على كود تفعيل الجهاز
        device_activation = DeviceActivationCode.query.filter_by(device_id=device.device_uid).order_by(DeviceActivationCode.created_at.desc()).first()
        
        profile_data = {
            'device_id': device.device_uid,
            'device_name': device.device_name or 'جهاز',
            'device_type': device.device_type or 'unknown',
            'user_id': user.id,
            'username': user.username,
            'first_login_at': device.first_login_at.isoformat() if device.first_login_at else None,
            'last_login_at': device.last_login_at.isoformat() if device.last_login_at else None,
            'is_active': device.is_active,
            'distributor': reseller.name if reseller else 'N/A',
            'distributor_id': reseller.id if reseller else None,
            'expiration_date': activation_code.expiration_date.isoformat() if activation_code and activation_code.expiration_date else None,
            'device_activation_code': device_activation.activation_code if device_activation else None,
        }
        
        return jsonify({
            'success': True,
            'data': profile_data
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في الحصول على ملف المستخدم: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/profile/update-device-name', methods=['POST'])
@user_login_required
def update_device_name():
    """تحديث اسم الجهاز"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        data = request.get_json()
        device_name = data.get('device_name', '').strip()
        
        if not device_name:
            return jsonify({'success': False, 'message': 'اسم الجهاز لا يمكن أن يكون فارغاً'}), 400
        
        if len(device_name) > 100:
            return jsonify({'success': False, 'message': 'اسم الجهاز طويل جداً'}), 400
        
        device.device_name = device_name
        db.session.commit()
        
        log_user_action(device.user_id, action='update_device_name',
                       description=f'تحديث اسم الجهاز إلى {device_name}', resource_type='device', resource_id=device.id)
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث اسم الجهاز بنجاح',
            'data': {'device_name': device.device_name}
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تحديث اسم الجهاز: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/profile/subscription', methods=['GET'])
@user_login_required
def get_subscription_info():
    """الحصول على معلومات الاشتراك"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        user = device.user
        # البحث عن كود التفعيل الخاص بهذا المستخدم
        activation_code = ActivationCode.query.filter_by(assigned_user_id=user.id).first()
        
        # حساب حالة الاشتراك
        is_active = False
        if activation_code:
            if activation_code.is_lifetime:
                is_active = True
            elif activation_code.expiration_date:
                # الحصول على التاريخ الحالي
                current_time = datetime.now(timezone.utc) if activation_code.expiration_date.tzinfo else datetime.utcnow()
                # التاريخ الحالي يجب أن يكون قبل تاريخ الانتهاء
                is_active = safe_datetime_compare(current_time, activation_code.expiration_date)
        
        subscription_data = {
            'status': 'active' if is_active else 'inactive',
            'plan': activation_code.code if activation_code else 'No Plan',
            'is_lifetime': activation_code.is_lifetime if activation_code else False,
            'duration_months': activation_code.duration_months if activation_code else 0,
            'activated_at': activation_code.activated_at.isoformat() if activation_code and activation_code.activated_at else None,
            'expiration_date': activation_code.expiration_date.isoformat() if activation_code and activation_code.expiration_date else None,
            'max_devices': activation_code.max_devices if activation_code else 0,
        }
        
        return jsonify({
            'success': True,
            'data': subscription_data
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في الحصول على معلومات الاشتراك: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/series')
@user_login_required
@monitor_performance
def series():
    """صفحة سلسلة البرامج"""
    device_uid = session.get('device_uid')
    device = get_device_with_user(device_uid, is_active=False)
    
    template = get_template_path('series.html')
    return render_template(template, device=device)


@users_bp.route('/movies')
@user_login_required
@monitor_performance
def movies():
    """صفحة الأفلام"""
    device_uid = session.get('device_uid')
    device = get_device_with_user(device_uid, is_active=False)
    
    template = get_template_path('movies.html')
    return render_template(template, device=device)


@users_bp.route('/settings')
@user_login_required
@monitor_performance
def settings():
    """صفحة إعدادات المستخدم"""
    device_uid = session.get('device_uid')
    device = get_device_with_user(device_uid, is_active=False)
    
    template = get_template_path('settings.html')
    return render_template(template, device=device)


@users_bp.route('/api/settings', methods=['GET'])
@user_login_required
def get_user_settings():
    """الحصول على إعدادات المستخدم"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        settings_data = {
            'device_id': device.device_uid,
            'device_name': device.device_name or 'جهاز',
            'media_link': device.media_link or '',
            'device_type': device.device_type or 'unknown',
            'first_login_at': device.first_login_at.isoformat() if device.first_login_at else None,
            'last_login_at': device.last_login_at.isoformat() if device.last_login_at else None,
        }
        
        return jsonify({
            'success': True,
            'data': settings_data
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في الحصول على الإعدادات: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/settings/playlist', methods=['POST'])
@user_login_required
def save_playlist_settings():
    """حفظ رابط البلايليست"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        data = request.get_json()
        playlist_url = data.get('playlistUrl', '').strip()
        
        if not playlist_url:
            return jsonify({'success': False, 'message': 'يرجى إدخال رابط صحيح'}), 400
        
        # تحديث رابط البلايليست في قاعدة البيانات
        device.media_link = playlist_url
        db.session.commit()
        
        log_user_action(device.user_id, action='update_playlist', 
                       description=f'تحديث رابط البلايليست', resource_type='device', resource_id=device.id)
        
        return jsonify({
            'success': True,
            'message': 'تم حفظ رابط البلايليست بنجاح',
            'data': {'media_link': device.media_link}
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في حفظ البلايليست: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


# ========================================================================================
# 🎵 API للـ User Playlists (نظام البلايليست المتعددة)
# ========================================================================================

@users_bp.route('/api/playlists', methods=['GET'])
@user_login_required
def get_user_playlists():
    """جلب جميع البلايليسترات للمستخدم الحالي"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        # استيراد UserPlaylist من models
        from models import UserPlaylist
        
        # جلب جميع البلايليسترات
        playlists = UserPlaylist.query.filter_by(user_id=device.user_id).all()
        
        playlists_data = [{
            'id': p.id,
            'name': p.name,
            'media_link': p.media_link,
            'is_active': p.is_active,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'updated_at': p.updated_at.isoformat() if p.updated_at else None
        } for p in playlists]
        
        return jsonify({
            'success': True,
            'data': playlists_data,
            'total': len(playlists_data)
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في جلب البلايليسترات: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/playlists', methods=['POST'])
@user_login_required
def add_playlist():
    """إضافة بلايليست جديد"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        from models import UserPlaylist
        
        data = request.get_json()
        name = data.get('name', '').strip()
        media_link = data.get('media_link', '').strip()
        
        if not name or not media_link:
            return jsonify({'success': False, 'message': 'يرجى إدخال الاسم والرابط'}), 400
        
        # إنشاء بلايليست جديد
        playlist = UserPlaylist(
            user_id=device.user_id,
            device_id=device.id,
            name=name,
            media_link=media_link,
            is_active=True
        )
        
        db.session.add(playlist)
        db.session.commit()
        
        log_user_action(
            user_id=device.user_id,
            action='add_playlist',
            description=f'إضافة بلايليست: {name}',
            resource_type='playlist',
            resource_id=playlist.id
        )
        
        return jsonify({
            'success': True,
            'message': 'تم إضافة البلايليست بنجاح',
            'data': {
                'id': playlist.id,
                'name': playlist.name,
                'media_link': playlist.media_link,
                'is_active': playlist.is_active,
                'created_at': playlist.created_at.isoformat() if playlist.created_at else None
            }
        }), 201
    
    except Exception as e:
        print(f"❌ خطأ في إضافة البلايليست: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/playlists/<int:playlist_id>/toggle', methods=['PUT'])
@user_login_required
def toggle_playlist_status(playlist_id):
    """تفعيل/تعطيل بلايليست"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        from models import UserPlaylist
        
        # التحقق من أن البلايليست ينتمي للمستخدم الحالي
        playlist = UserPlaylist.query.filter_by(
            id=playlist_id,
            user_id=device.user_id
        ).first()
        
        if not playlist:
            return jsonify({'success': False, 'message': 'البلايليست غير موجود'}), 404
        
        # تفعيل/تعطيل
        playlist.is_active = not playlist.is_active
        db.session.commit()
        
        log_user_action(
            device.user_id,
            action='toggle_playlist',
            description=f'{"تفعيل" if playlist.is_active else "تعطيل"}: {playlist.name}',
            resource_type='playlist',
            resource_id=playlist.id
        )
        
        return jsonify({
            'success': True,
            'message': f'تم {"تفعيل" if playlist.is_active else "تعطيل"} البلايليست',
            'data': {
                'id': playlist.id,
                'is_active': playlist.is_active
            }
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تغيير حالة البلايليست: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/playlists/<int:playlist_id>', methods=['DELETE'])
@user_login_required
def delete_playlist(playlist_id):
    """حذف بلايليست"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        from models import UserPlaylist
        
        # التحقق من أن البلايليست ينتمي للمستخدم الحالي
        playlist = UserPlaylist.query.filter_by(
            id=playlist_id,
            user_id=device.user_id
        ).first()
        
        if not playlist:
            return jsonify({'success': False, 'message': 'البلايليست غير موجود'}), 404
        
        playlist_name = playlist.name
        db.session.delete(playlist)
        db.session.commit()
        
        log_user_action(
            user_id=device.user_id,
            action='delete_playlist',
            description=f'حذف بلايليست: {playlist_name}',
            resource_type='playlist',
            resource_id=playlist_id
        )
        
        return jsonify({
            'success': True,
            'message': 'تم حذف البلايليست بنجاح'
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في حذف البلايليست: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/settings/quality', methods=['POST'])
@user_login_required
def save_quality_settings():
    """حفظ إعدادات جودة الفيديو"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        data = request.get_json()
        quality = data.get('quality', 'auto')
        
        # يمكن حفظ الجودة في قاعدة البيانات إذا كان هناك حقل خاص بها
        # أو حفظها في localStorage بجانب العميل
        
        log_user_action(device.user_id, action='update_quality',
                       description=f'تغيير جودة الفيديو إلى {quality}', resource_type='device', resource_id=device.id)
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث جودة الفيديو',
            'data': {'quality': quality}
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في حفظ إعدادات الجودة: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/settings/language', methods=['POST'])
@user_login_required
def save_language_settings():
    """حفظ إعدادات اللغة"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        data = request.get_json()
        language = data.get('language', 'en')
        
        log_user_action(device.user_id, action='update_language',
                       description=f'تغيير اللغة إلى {language}', resource_type='device', resource_id=device.id)
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث اللغة',
            'data': {'language': language}
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في حفظ إعدادات اللغة: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/settings/playback', methods=['POST'])
@user_login_required
def save_playback_settings():
    """حفظ إعدادات التشغيل"""
    try:
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'جهاز غير صحيح'}), 403
        
        data = request.get_json()
        autoplay = data.get('autoplay', False)
        remember_position = data.get('rememberPosition', False)
        
        log_user_action(device.user_id, action='update_playback_settings',
                       description=f'تحديث إعدادات التشغيل - autoplay: {autoplay}, rememberPosition: {remember_position}',
                       resource_type='device', resource_id=device.id)
        
        return jsonify({
            'success': True,
            'message': 'تم حفظ إعدادات التشغيل',
            'data': {
                'autoplay': autoplay,
                'rememberPosition': remember_position
            }
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في حفظ إعدادات التشغيل: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/my-list', methods=['GET'])
@user_login_required
def my_list():
    """الحصول على أجهزة المستخدم"""
    device_uid = session.get('device_uid')
    device = Device.query.filter_by(device_uid=device_uid).first()
    
    template = get_template_path('playlist.html')
    return render_template(template, device=device)






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
        # 8️⃣ إرجاع البيانات (مع البلايليسترات المفعلة فقط)
        # ============================================================================
        
        # جلب جميع البلايليسترات المفعلة فقط
        from models import UserPlaylist
        playlists = UserPlaylist.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()
        
        playlists_data = [{
            'id': p.id,
            'name': p.name,
            'media_link': p.media_link,
            'is_active': p.is_active,
            'is_reseller_playlist': bool(p.reseller_playlist),
            'created_at': p.created_at.isoformat() if p.created_at else None
        } for p in playlists]
        
        return jsonify({
            'success': True,
            'message': 'Device login successful',
            'data': {
                'token': session_token,
                'user_id': user_id,
                'username': user.username,
                'device_id': device.device_uid,
                'media_link': device.media_link,  # للتوافقية مع الأجهزة القديمة
                'playlists': playlists_data,  # البلايليسترات الجديدة
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


# ============================================================================
# 🎬 نظام IPTV/M3U - جلب وتحليل المحتوى
# ============================================================================

@users_bp.route('/api/stream/token', methods=['POST'])
def get_stream_token():
    """
    المرحلة 1: إصدار توكن Stream للجهاز
    
    📝 الطلب:
    {
        "device_id": "DEV-XXXXX"
    }
    
    ✅ الرد:
    {
        "status": "active",
        "playlist_url": "https://api.yoursite.com/stream/playlist?token=XXXX"
    }
    """
    try:
        data = request.get_json() or {}
        device_uid = data.get('device_id') or session.get('device_uid')
        
        print(f"📌 Token request - device_uid: {device_uid}, session keys: {list(session.keys())}")
        
        if not device_uid:
            print('❌ No device_uid found in request or session')
            return jsonify({'success': False, 'message': 'Device ID required'}), 400
        
        # ✅ التحقق من الجهاز والاشتراك
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device:
            print(f'❌ Device not found: {device_uid}')
            return jsonify({'success': False, 'message': 'Device not found or inactive'}), 403
            
        if not device.user_id:
            print(f'❌ Device {device_uid} has no user_id')
            return jsonify({'success': False, 'message': 'Device not linked to user'}), 403
        
        user = User.query.get(device.user_id)
        if not user:
            print(f'❌ User not found for device {device_uid}')
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # التحقق من صلاحية الاشتراك
        activation = ActivationCode.query.filter_by(assigned_user_id=device.user_id).first()
        now = datetime.now(timezone.utc)
        
        if not activation:
            print(f'❌ No activation code for user {device.user_id}')
            return jsonify({'success': False, 'message': 'No active subscription'}), 403
            
        if activation.expiration_date and safe_datetime_compare(activation.expiration_date, now):
            print(f'❌ Subscription expired for user {device.user_id}: {activation.expiration_date}')
            return jsonify({'success': False, 'message': 'Subscription expired'}), 403
        
        # ✅ التحقق من وجود media_link
        if not device.media_link:
            print(f'❌ Device {device_uid} has no media_link')
            return jsonify({'success': False, 'message': 'Device has no media link configured'}), 403
        
        # 🔐 توليد توكن Stream (صلاحية 24 ساعة)
        stream_token = secrets.token_urlsafe(32)
        
        # حفظ التوكن في Session (أو يمكن استخدام Redis)
        session[f'stream_token_{device_uid}'] = stream_token
        session.permanent = True
        
        playlist_url = f"{request.host_url.rstrip('/')}/stream/playlist?token={stream_token}"
        
        print(f"✅ Token generated for device {device_uid}: {stream_token[:20]}...")
        print(f"✅ Playlist URL: {playlist_url}")
        
        return jsonify({
            'success': True,
            'status': 'active',
            'playlist_url': playlist_url,
            'token': stream_token,
            'token_expires': 86400  # 24 hours
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في إصدار stream token: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/stream/playlist', methods=['GET'])
def stream_playlist():
    """
    المرحلة 2: جلب ملف M3U من البلايليسترات المفعلة فقط
    
    🔐 التحقق من:
    1. التوكن صحيح
    2. الجهاز مفعل
    3. الاشتراك ساري
    4. البلايليستات المفعلة فقط
    
    🎯 العملية:
    1. جلب البلايليسترات المفعلة من DB
    2. دمج محتوى M3U من جميع البلايليسترات النشطة فقط
    3. إعادة الملف الموحد للتطبيق
    """
    try:
        token = request.args.get('token')
        
        if not token:
            print('❌ No token provided')
            return jsonify({'success': False, 'message': 'Token required'}), 401
        
        print(f"🔍 Validating token: {token[:20]}..., session keys: {list(session.keys())}")
        
        # 🔍 البحث عن الجهاز المرتبط بالتوكن
        device = None
        device_uid = None
        try:
            for key in list(session.keys()):
                if key.startswith('stream_token_') and session.get(key) == token:
                    device_uid = key.replace('stream_token_', '')
                    print(f"✅ Token matched to device_uid: {device_uid}")
                    device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
                    if device:
                        print(f"✅ Device found: {device_uid}")
                        break
        except Exception as e:
            print(f'❌ Error searching session for token: {str(e)}')
        
        if not device:
            print(f'❌ Device not found for token or device is inactive. Token: {token[:20]}...')
            return jsonify({'success': False, 'message': 'Invalid token or device not found'}), 403
        
        # التحقق من صلاحية الاشتراك
        activation = ActivationCode.query.filter_by(assigned_user_id=device.user_id).first()
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            print(f'❌ Subscription not active for user {device.user_id}')
            return jsonify({'success': False, 'message': 'Subscription expired'}), 403
        
        # ============================================================================
        # جلب البلايليسترات المفعلة فقط
        # ============================================================================
        
        from models import UserPlaylist
        active_playlists = UserPlaylist.query.filter_by(
            user_id=device.user_id,
            is_active=True
        ).all()
        
        if not active_playlists:
            print(f'❌ No active playlists for user {device.user_id}')
            # إرجاع ملف M3U فارغ
            from flask import Response
            return Response(
                '#EXTM3U\n',
                mimetype='application/vnd.apple.mpegurl',
                headers={'Content-Disposition': 'attachment; filename=playlist.m3u8'}
            )
        
        # ============================================================================
        # دمج محتوى M3U من جميع البلايليسترات النشطة
        # ============================================================================
        
        import requests
        
        merged_m3u = '#EXTM3U\n'
        playlist_count = 0
        
        for playlist in active_playlists:
            try:
                print(f"📥 Fetching playlist from: {playlist.media_link}")
                response = requests.get(playlist.media_link, timeout=10)
                response.raise_for_status()
                
                # إزالة سطر #EXTM3U الأول إن وجد
                content = response.text
                if content.startswith('#EXTM3U'):
                    content = content[7:].lstrip('\n')
                
                merged_m3u += f'\n# Playlist: {playlist.name}\n'
                merged_m3u += content
                playlist_count += 1
                
                print(f"✅ Playlist '{playlist.name}' added successfully ({len(response.content)} bytes)")
                
            except requests.RequestException as e:
                print(f"⚠️ تحذير: فشل جلب البلايليست '{playlist.name}' من {playlist.media_link}: {str(e)}")
                # متابعة مع البلايليسترات الأخرى
                continue
        
        if playlist_count == 0:
            print(f'⚠️ Failed to fetch any active playlists for user {device.user_id}')
            from flask import Response
            return Response(
                '#EXTM3U\n',
                mimetype='application/vnd.apple.mpegurl',
                headers={'Content-Disposition': 'attachment; filename=playlist.m3u8'}
            )
        
        print(f"✅ Merged {playlist_count} active playlists successfully")
        
        # إرجاع ملف M3U الموحد
        from flask import Response
        return Response(
            merged_m3u,
            mimetype='application/vnd.apple.mpegurl',
            headers={'Content-Disposition': 'attachment; filename=playlist.m3u8'}
        )
    
    except Exception as e:
        print(f"❌ خطأ في stream playlist: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/stream/m3u-info', methods=['POST'])
@user_login_required
def get_m3u_info():
    """
    المرحلة 3: معلومات M3U المحللة (عدد القنوات، الفئات، إلخ)
    
    يُستخدم لإظهار معلومات سريعة في Dashboard دون تحميل كامل الملف
    """
    try:
        import requests
        import re
        
        device_uid = session.get('device_uid')
        device = Device.query.filter_by(device_uid=device_uid).first()
        
        if not device or not device.media_link:
            return jsonify({'success': False, 'message': 'No media link'}), 404
        
        # جلب ملف M3U
        response = requests.get(device.media_link, timeout=10)
        response.raise_for_status()
        
        lines = response.text.split('\n')
        
        # إحصائيات سريعة
        stats = {
            'total_channels': 0,
            'categories': {},
            'has_tvg_id': 0,
            'has_logo': 0
        }
        
        for line in lines:
            if line.startswith('#EXTINF'):
                stats['total_channels'] += 1
                
                # استخراج group-title
                group_match = re.search(r'group-title="([^"]+)"', line)
                if group_match:
                    group = group_match.group(1)
                    stats['categories'][group] = stats['categories'].get(group, 0) + 1
                
                # تحقق من tvg-id و logo
                if 'tvg-id=' in line:
                    stats['has_tvg_id'] += 1
                if 'tvg-logo=' in line:
                    stats['has_logo'] += 1
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تحليل M3U: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


#=============================================================
#  🎬 صفحات عرض IPTV
#=============================================================

@users_bp.route('/iptv-player', methods=['GET'])
@user_login_required
def iptv_player():
    """
    صفحة مشغل IPTV الرئيسية
    
    تتطلب:
    - المستخدم مسجل دخول (session['device_uid'])
    - جهاز نشط مع اشتراك سارٍ
    
    المتطلبات:
    1. التحقق من صحة الجهاز
    2. التحقق من صحة الاشتراك
    3. عرض صفحة التطبيق
    """
    try:
        device_uid = session.get('device_uid')
        
        # 1️⃣ جلب بيانات الجهاز
        device = Device.query.filter_by(
            device_uid=device_uid,
            is_active=True
        ).first()
        
        if not device:
            print(f"⚠️ جهاز غير نشط: {device_uid}")
            return redirect(url_for('users.login'))
        
        # 2️⃣ التحقق من صحة الاشتراك
        activation_code = ActivationCode.query.get(device.activation_code_id)
        now = datetime.now(timezone.utc)
        
        if not activation_code or (activation_code.expiration_date and safe_datetime_compare(activation_code.expiration_date, now)):
            print(f"⚠️ اشتراك منتهي: {device_uid}")
            return jsonify({
                'error': 'اشتراكك منتهي الصلاحية'
            }), 403
        
        # 3️⃣ التحقق من وجود ملف M3U
        if not device.media_link:
            print(f"⚠️ لا يوجد رابط M3U للجهاز: {device_uid}")
            return jsonify({
                'error': 'لم يتم تكوين مصدر البث للجهاز'
            }), 400
        
        # ✅ السماح بالدخول
        print(f"✅ دخول صفحة IPTV Player: {device_uid}")
        log_user_action(device.user_id, 'IPTV_PAGE_VIEWED', 'دخول صفحة مشغل IPTV')
        
        template = get_template_path('iptv-player.html')
        return render_template(template, device_name=device.device_name)
        
    except Exception as e:
        print(f"❌ خطأ في صفحة IPTV: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


#=============================================================
#  ▶️ تشغيل المحتوى (Streaming Play)
#=============================================================

@users_bp.route('/api/stream/play', methods=['POST'])
@user_login_required
def stream_play():
    """
    🎬 تشغيل محتوى (قناة، فيلم، مسلسل)
    
    ✅ الطريقة الصحيحة:
    - لا نحاول جلب البث من Backend
    - نرسل الرابط مباشرة للجهاز
    - الجهاز (Browser) يشغله مع headers صحيحة
    
    لماذا؟
    - Server-side requests تحجبها معظم CDNs
    - Browser requests لها headers صحيحة (User-Agent, Referer, etc)
    
    الطلب:
    {
        "stream_url": "https://cdn.example.com/hls/channel.m3u8",
        "content_id": "ar-one",
        "content_name": "AR One"
    }
    
    الاستجابة:
    {
        "success": true,
        "play_url": "https://cdn.example.com/hls/channel.m3u8"  ← نفس الرابط
    }
    """
    try:
        data = request.get_json()
        device_uid = session.get('device_uid')
        stream_url = data.get('stream_url')
        content_id = data.get('content_id', 'unknown')
        content_name = data.get('content_name', 'Unknown')
        
        if not device_uid:
            return jsonify({'success': False, 'message': 'Device not authenticated'}), 401
        
        if not stream_url:
            return jsonify({'success': False, 'message': 'Stream URL required'}), 400
        
        # ✅ التحقق من الجهاز
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        
        if not device or not device.user_id:
            return jsonify({'success': False, 'message': 'Device not found'}), 403
        
        # ✅ التحقق من الاشتراك
        activation = ActivationCode.query.filter_by(assigned_user_id=device.user_id).first()
        now = datetime.now(timezone.utc)
        
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            print(f"⚠️ محاولة تشغيل مع اشتراك منتهي: {device_uid}")
            return jsonify({
                'success': False,
                'message': 'الاشتراك غير مفعل أو منتهي الصلاحية',
                'error_code': 'SUBSCRIPTION_INVALID'
            }), 403
        
        # 📝 تحديث نشاط الجهاز
        device.last_login_at = now
        device.last_ip = request.remote_addr
        db.session.commit()
        
        # 📝 تسجيل النشاط
        log_user_action(
            device.user_id,
            'STREAM_PLAY',
            f'تشغيل: {content_name} (ID: {content_id})'
        )
        
        print(f"✅ تم توليد توكن تشغيل: {content_name} على جهاز {device_uid}")
        
        # 🎫 توليد play token جديد (تفويض مؤقت للتشغيل)
        play_token = secrets.token_urlsafe(32)
        token_expiry = now + timedelta(minutes=30)  # التوكن يصلح 30 دقيقة
        
        # حفظ بيانات التشغيل في session مع التوكن
        session[f'play_token_{device_uid}'] = {
            'token': play_token,
            'stream_url': stream_url,
            'content_name': content_name,
            'content_id': content_id,
            'expires_at': token_expiry,
            'user_id': device.user_id
        }
        session.modified = True
        
        # ✅ إرجاع التوكن فقط (بدون الرابط)
        return jsonify({
            'success': True,
            'play_token': play_token,  # ← التوكن للخطوة التالية
            'message': 'Play token generated. Use /stream/live?token=... to get the URL'
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تشغيل المحتوى: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/stream/live', methods=['GET'])
def stream_live():
    """
    🎬 API لإرجاع رابط البث (بدون streaming)
    
    الدور:
    ✅ التحقق من التوكن والصلاحيات
    ✅ تسجيل المشاهدة
    ✅ إرجاع الرابط فقط
    
    ❌ لا نجلب الفيديو
    ❌ لا proxy
    ❌ لا requests.get
    """
    try:
        token = request.args.get('token')
        
        if not token:
            return jsonify({'success': False, 'error': 'Token required'}), 401
        
        # 🔍 البحث عن البيانات المرتبطة بالتوكن
        play_data = None
        device_uid = None
        
        for key in list(session.keys()):
            if key.startswith('play_token_') and session.get(key, {}).get('token') == token:
                device_uid = key.replace('play_token_', '')
                play_data = session.get(key)
                break
        
        if not play_data or not device_uid:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        # التحقق من صلاحية التوكن
        now = datetime.now(timezone.utc)
        expires_at = play_data.get('expires_at')
        if expires_at and expires_at < now:
            return jsonify({'success': False, 'error': 'Token expired'}), 403
        
        # ✅ التحقق من الجهاز
        device = Device.query.filter_by(device_uid=device_uid, is_active=True).first()
        if not device:
            return jsonify({'success': False, 'error': 'Device not found'}), 403
        
        # ✅ التحقق من الاشتراك
        activation = ActivationCode.query.filter_by(assigned_user_id=device.user_id).first()
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            return jsonify({'success': False, 'error': 'Subscription expired'}), 403
        
        # 📡 الرابط بدون جلب
        stream_url = play_data.get('stream_url')
        content_name = play_data.get('content_name', 'Stream')
        
        # ✅ تسجيل المشاهدة
        device.last_login_at = now
        device.last_ip = request.remote_addr
        db.session.commit()
        
        # 📊 تسجيل في audit
        log_user_action(
            device.user_id,
            'view_stream',
            f'Viewed: {content_name}',
            request.remote_addr
        )
        
        print(f"✅ تصريح البث: {content_name} → {stream_url}")
        
        # ❌ لا نجلب، نرسل الرابط فقط
        return jsonify({
            'success': True,
            'play_url': stream_url,
            'type': 'hls',  # ← معلومة للفرونتند
            'content_name': content_name,
            'message': 'Stream authorized'
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في /stream/live: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


#=============================================================
#  📊 صفحات العرض (Live TV, Movies, Series)
#=============================================================

@users_bp.route('/live-tv', methods=['GET'])
@user_login_required
@monitor_performance
def live_tv_page():
    """صفحة Live TV مع تكامل IPTV"""
    try:
        device_uid = session.get('device_uid')
        device = get_device_with_activation(device_uid, is_active=True)
        
        if not device:
            return redirect(url_for('users.login'))
        
        # التحقق من الاشتراك
        activation = get_activation_for_user(device.user_id)
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            template = get_template_path('live-tv.html')
            return render_template(template, error='Subscription expired')
        
        log_user_action(device.user_id, 'LIVE_TV_VIEWED', 'فتح صفحة Live TV')
        
        template = get_template_path('live-tv.html')
        return render_template(template, device=device)
    
    except Exception as e:
        print(f"❌ خطأ في صفحة Live TV: {str(e)}")
        template = get_template_path('live-tv.html')
        return render_template(template, error=str(e))


@users_bp.route('/movies', methods=['GET'])
@user_login_required
@monitor_performance
def movies_page():
    """صفحة Movies مع تكامل IPTV"""
    try:
        device_uid = session.get('device_uid')
        device = get_device_with_activation(device_uid, is_active=True)
        
        if not device:
            return redirect(url_for('users.login'))
        
        # التحقق من الاشتراك
        activation = get_activation_for_user(device.user_id)
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            template = get_template_path('movies.html')
            return render_template(template, error='Subscription expired')
        
        log_user_action(device.user_id, 'MOVIES_VIEWED', 'فتح صفحة Movies')
        
        template = get_template_path('movies.html')
        return render_template(template, device=device)
    
    except Exception as e:
        print(f"❌ خطأ في صفحة Movies: {str(e)}")
        template = get_template_path('movies.html')
        return render_template(template, error=str(e))


@users_bp.route('/series-details', methods=['GET'])
@user_login_required
@monitor_performance
def series_details_page():
    """صفحة تفاصيل المسلسل مع الحلقات"""
    try:
        device_uid = session.get('device_uid')
        series_id = request.args.get('id')  # الحصول على معرف المسلسل من الـ URL
        
        device = get_device_with_activation(device_uid, is_active=True)
        
        if not device:
            return redirect(url_for('users.login'))
        
        # التحقق من الاشتراك
        activation = get_activation_for_user(device.user_id)
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            template = get_template_path('series-details.html')
            return render_template(template, error='Subscription expired')
        
        log_user_action(device.user_id, 'SERIES_DETAILS_VIEWED', f'فتح صفحة تفاصيل المسلسل: {series_id}')
        
        template = get_template_path('series-details.html')
        return render_template(template, device=device, series_id=series_id)
    
    except Exception as e:
        print(f"❌ خطأ في صفحة تفاصيل المسلسل: {str(e)}")
        template = get_template_path('series-details.html')
        return render_template(template, error=str(e))


@users_bp.route('/series', methods=['GET'])
@user_login_required
@monitor_performance
def series_page():
    """صفحة Series مع تكامل IPTV"""
    try:
        device_uid = session.get('device_uid')
        device = get_device_with_activation(device_uid, is_active=True)
        
        if not device:
            return redirect(url_for('users.login'))
        
        # التحقق من الاشتراك
        activation = get_activation_for_user(device.user_id)
        now = datetime.now(timezone.utc)
        if not activation or (activation.expiration_date and safe_datetime_compare(activation.expiration_date, now)):
            template = get_template_path('series.html')
            return render_template(template, error='Subscription expired')
        
        log_user_action(device.user_id, 'SERIES_VIEWED', 'فتح صفحة Series')
        
        template = get_template_path('series.html')
        return render_template(template, device=device)
    
    except Exception as e:
        print(f"❌ خطأ في صفحة Series: {str(e)}")
        template = get_template_path('series.html')
        return render_template(template, error=str(e))


#=============================================================
#  🛑 STEP 3.9: إدارة الأجهزة والاشتراكات
#=============================================================

@users_bp.route('/api/device/disable', methods=['POST'])
def disable_device():
    """
    🛑 إيقاف جهاز (من الأدمن أو الموزع)
    
    الطلب:
    {
        "device_id": "DEV-XXXXX",
        "reason": "اشتراك منتهي" | "انتهاك الشروط"
    }
    
    النتيجة:
    - devices.is_active = False
    - التطبيق يفشل في جلب Playlist
    - يعرض "الاشتراك غير مفعل"
    """
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        reason = data.get('reason', 'Admin action')
        
        if not device_id:
            return jsonify({'success': False, 'message': 'device_id required'}), 400
        
        # جلب الجهاز
        device = Device.query.filter_by(device_uid=device_id).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'Device not found'}), 404
        
        # إيقاف الجهاز
        device.is_active = False
        device.disabled_at = datetime.utcnow()
        device.disabled_reason = reason
        db.session.commit()
        
        # تسجيل النشاط
        log_user_action(
            device.user_id,
            'DEVICE_DISABLED',
            f'تم تعطيل الجهاز: {reason}'
        )
        
        print(f"🛑 تم تعطيل الجهاز: {device_id} - السبب: {reason}")
        
        return jsonify({
            'success': True,
            'message': f'تم تعطيل الجهاز: {device_id}',
            'device_id': device_id,
            'disabled_at': device.disabled_at.isoformat()
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تعطيل الجهاز: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/device/enable', methods=['POST'])
def enable_device():
    """
    ✅ تفعيل جهاز معطّل
    """
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        
        if not device_id:
            return jsonify({'success': False, 'message': 'device_id required'}), 400
        
        # جلب الجهاز
        device = Device.query.filter_by(device_uid=device_id).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'Device not found'}), 404
        
        # تفعيل الجهاز
        device.is_active = True
        device.disabled_at = None
        device.disabled_reason = None
        db.session.commit()
        
        # تسجيل النشاط
        log_user_action(
            device.user_id,
            'DEVICE_ENABLED',
            'تم تفعيل الجهاز'
        )
        
        print(f"✅ تم تفعيل الجهاز: {device_id}")
        
        return jsonify({
            'success': True,
            'message': f'تم تفعيل الجهاز: {device_id}',
            'device_id': device_id
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في تفعيل الجهاز: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/subscription/disable', methods=['POST'])
def disable_subscription():
    """
    🛑 إيقاف اشتراك (من الموزع)
    
    الطلب:
    {
        "user_id": 123 | "activation_code_id": 456
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        activation_code_id = data.get('activation_code_id')
        reason = data.get('reason', 'Subscription cancelled')
        
        # جلب كود التفعيل
        if user_id:
            activation = ActivationCode.query.filter_by(assigned_user_id=user_id).first()
        elif activation_code_id:
            activation = ActivationCode.query.get(activation_code_id)
        else:
            return jsonify({'success': False, 'message': 'user_id or activation_code_id required'}), 400
        
        if not activation:
            return jsonify({'success': False, 'message': 'Subscription not found'}), 404
        
        # إيقاف الاشتراك (تعيين تاريخ انتهاء في الماضي)
        activation.expiration_date = datetime.utcnow()
        db.session.commit()
        
        # إيقاف جميع أجهزة المستخدم
        if user_id:
            devices = Device.query.filter_by(user_id=user_id).all()
            for device in devices:
                device.is_active = False
                device.disabled_reason = reason
            db.session.commit()
        
        print(f"🛑 تم إيقاف الاشتراك - السبب: {reason}")
        
        return jsonify({
            'success': True,
            'message': 'تم إيقاف الاشتراك',
            'affected_devices': len(devices) if user_id else 0
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في إيقاف الاشتراك: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@users_bp.route('/api/device/status', methods=['GET'])
def get_device_status():
    """
    📊 الحصول على حالة الجهاز
    
    المعلومات المُرجعة:
    - is_active
    - disabled_reason
    - last_login_at
    - last_ip
    - subscription status
    """
    try:
        device_uid = request.args.get('device_uid') or session.get('device_uid')
        
        if not device_uid:
            return jsonify({'success': False, 'message': 'device_uid required'}), 400
        
        device = Device.query.filter_by(device_uid=device_uid).first()
        
        if not device:
            return jsonify({'success': False, 'message': 'Device not found'}), 404
        
        # جلب معلومات الاشتراك
        activation = ActivationCode.query.filter_by(assigned_user_id=device.user_id).first()
        
        subscription_status = 'unknown'
        if activation:
            if activation.expiration_date > datetime.utcnow():
                subscription_status = 'active'
            else:
                subscription_status = 'expired'
        else:
            subscription_status = 'none'
        
        return jsonify({
            'success': True,
            'device': {
                'device_uid': device.device_uid,
                'device_name': device.device_name,
                'is_active': device.is_active,
                'disabled_reason': device.disabled_reason,
                'last_login_at': device.last_login_at.isoformat() if device.last_login_at else None,
                'last_ip': device.last_ip,
                'created_at': device.created_at.isoformat() if device.created_at else None
            },
            'subscription': {
                'status': subscription_status,
                'expiration_date': activation.expiration_date.isoformat() if activation else None,
                'days_remaining': (activation.expiration_date - datetime.utcnow()).days if activation and subscription_status == 'active' else 0
            }
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في جلب حالة الجهاز: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500



#================================================================
# 🎬 HLS Player Route
#================================================================

@users_bp.route('/hls-player', methods=['GET'])
def hls_player():
    """عرض مشغل HLS للبث المباشر والفيديو"""
    try:
        return render_template('hls-player.html')
    except Exception as e:
        print(f"❌ خطأ في تحميل مشغل HLS: {str(e)}")
        return render_template('error.html', error='فشل تحميل مشغل HLS'), 500


#================================================================
# 🔍 Device Type Detection API
#================================================================

@users_bp.route('/api/device/type', methods=['GET'])
def detect_device_type():
    """الكشف عن نوع الجهاز (متصفح أم شاشة/Roku)"""
    try:
        user_agent = request.headers.get('User-Agent', '').lower()
        
        # الكشف عن نوع الجهاز من User-Agent
        is_browser = detect_browser_request(user_agent)
        
        return jsonify({
            'success': True,
            'device_type': 'browser' if is_browser else 'screen',
            'is_browser': is_browser,
            'user_agent': request.headers.get('User-Agent', '')
        }), 200
    
    except Exception as e:
        print(f"❌ خطأ في الكشف عن نوع الجهاز: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


def detect_browser_request(user_agent):
    """
    الكشف عن ما إذا كان الطلب من متصفح ويب حقيقي
    
    العودة: True إذا كان متصفح ويب، False إذا كان شاشة/Roku
    """
    user_agent = user_agent.lower()
    
    # المتصفحات الشهيرة
    browser_indicators = [
        'chrome',
        'firefox',
        'safari',
        'edge',
        'opera',
        'brave',
        'vivaldi',
        'whale',
        'googlebot',  # بعض الـ bots تعتبر متصفح
    ]
    
    # مؤشرات الشاشات والأجهزة المختصة
    screen_indicators = [
        'roku',
        'android tv',
        'smarttv',
        'appletv',
        'webos',
        'tizen',
        'orsay',
        'hbbtv',
        'gvf',
        'smarttvservice',
        'bml',
        'dlnadoc',
        'cordova',
        'electron',  # قد تكون تطبيق سطح المكتب
    ]
    
    # التحقق من مؤشرات الشاشات أولاً (الأولوية)
    for indicator in screen_indicators:
        if indicator in user_agent:
            return False
    
    # التحقق من مؤشرات المتصفح
    for indicator in browser_indicators:
        if indicator in user_agent:
            return True
    
    # إذا كان موبايل أو تابلت = متصفح
    if 'mobile' in user_agent or 'tablet' in user_agent:
        return True
    
    # بشكل افتراضي، اعتبره متصفح (للأمان والأفضلية)
    return True