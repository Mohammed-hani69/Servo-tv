"""
مساعد لتسجيل العمليات في جدول audit_log
"""
from models import AuditLog, db
from flask import request, session
from datetime import datetime

def log_action(actor_type, actor_id, action, description=None, resource_type=None, resource_id=None):
    """
    تسجيل عملية في audit_log
    
    المعاملات:
    - actor_type: نوع المستخدم (user, reseller, admin)
    - actor_id: معرف المستخدم
    - action: اسم العملية (create, update, delete, login, logout, إلخ)
    - description: وصف تفصيلي للعملية (اختياري)
    - resource_type: نوع المورد الذي تم التأثير عليه (reseller, user, device, activation_code, إلخ)
    - resource_id: معرف المورد الذي تم التأثير عليه (اختياري)
    """
    try:
        # الحصول على عنوان IP
        ip_address = request.remote_addr if request else None
        
        # إنشاء سجل جديد
        audit_log = AuditLog(
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            description=description,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address
        )
        
        db.session.add(audit_log)
        db.session.commit()
        
        print(f"✅ تم تسجيل العملية: {action} من قبل {actor_type} #{actor_id}")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ خطأ في تسجيل العملية: {str(e)}")
        return False


def log_admin_action(action, description=None, resource_type=None, resource_id=None):
    """
    مساعد لتسجيل عمليات الأدمن (يستخدم معرف الأدمن من الجلسة)
    """
    try:
        admin_id = session.get('admin_id')
        if not admin_id:
            return False
        
        return log_action(
            actor_type='admin',
            actor_id=admin_id,
            action=action,
            description=description,
            resource_type=resource_type,
            resource_id=resource_id
        )
    except Exception as e:
        print(f"❌ خطأ في تسجيل عملية الأدمن: {str(e)}")
        return False


def log_reseller_action(reseller_id, action, description=None, resource_type=None, resource_id=None):
    """
    مساعد لتسجيل عمليات الموزع
    """
    return log_action(
        actor_type='reseller',
        actor_id=reseller_id,
        action=action,
        description=description,
        resource_type=resource_type,
        resource_id=resource_id
    )


def log_user_action(user_id, action, description=None, resource_type=None, resource_id=None):
    """
    مساعد لتسجيل عمليات المستخدم العادي
    """
    return log_action(
        actor_type='user',
        actor_id=user_id,
        action=action,
        description=description,
        resource_type=resource_type,
        resource_id=resource_id
    )


def get_recent_activities(limit=4):
    """
    جلب آخر العمليات
    """
    try:
        activities = AuditLog.query.order_by(
            AuditLog.created_at.desc()
        ).limit(limit).all()
        
        result = []
        for activity in activities:
            result.append({
                'id': activity.id,
                'actor_type': activity.actor_type,
                'actor_id': activity.actor_id,
                'action': activity.action,
                'description': activity.description,
                'resource_type': activity.resource_type,
                'resource_id': activity.resource_id,
                'ip_address': activity.ip_address,
                'created_at': activity.created_at.isoformat() if activity.created_at else None
            })
        
        return result
    except Exception as e:
        print(f"❌ خطأ في جلب العمليات: {str(e)}")
        return []


def get_activity_description(activity):
    """
    حصول على وصف نصي للعملية لعرضها في الواجهة
    """
    action_map = {
        'create': 'إنشاء',
        'update': 'تحديث',
        'delete': 'حذف',
        'login': 'تسجيل دخول',
        'logout': 'تسجيل خروج',
        'activate': 'تفعيل',
        'deactivate': 'تعطيل',
        'topup': 'شحن رصيد',
        'view': 'عرض',
        'download': 'تحميل'
    }
    
    resource_map = {
        'reseller': 'موزع',
        'user': 'مستخدم',
        'device': 'جهاز',
        'activation_code': 'كود التفعيل',
        'topup': 'شحن',
        'invoice': 'فاتورة'
    }
    
    actor_type_map = {
        'admin': 'أدمن',
        'reseller': 'موزع',
        'user': 'مستخدم'
    }
    
    action_text = action_map.get(activity.get('action', ''), activity.get('action', ''))
    resource_text = resource_map.get(activity.get('resource_type', ''), activity.get('resource_type', ''))
    actor_text = actor_type_map.get(activity.get('actor_type', ''), activity.get('actor_type', ''))
    
    if activity.get('description'):
        return activity['description']
    
    if resource_text:
        return f"{action_text} {resource_text}"
    else:
        return action_text if action_text else 'عملية'
