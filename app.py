import os
from flask import Flask, render_template, request, jsonify, current_app, session
from dotenv import load_dotenv
from flask_wtf.csrf import CSRFProtect
from flask_socketio import SocketIO, emit, join_room, leave_room
from config import DEBUG, TESTING, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db, User, Reseller, Admin, Device, ActivationCode, DeviceActivationCode, AuditLog, SupportTicket, TicketMessage
from datetime import datetime

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

# إنشاء تطبيق Flask
app = Flask(__name__)

# إنشاء مجلد instance إذا لم يكن موجوداً
instance_path = os.path.join(os.path.dirname(__file__), 'instance')
os.makedirs(instance_path, exist_ok=True)

# تحميل الإعدادات
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DEBUG'] = DEBUG
app.config['TESTING'] = TESTING
# استخدام المسار الكامل لقاعدة البيانات
db_path = os.path.join(instance_path, 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['WTF_CSRF_CHECK_DEFAULT'] = False

# تهيئة قاعدة البيانات مع التطبيق
db.init_app(app)

# تهيئة CSRF Protection
csrf = CSRFProtect(app)

# تهيئة Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# مسار الصفحة الرئيسية
@app.route('/')
def index():
    return render_template('landingpage.html')


# معالج صحة التطبيق
@app.route('/api/health')
def health():
    """فحص صحة التطبيق والاتصال بقاعدة البيانات"""
    try:
        # التحقق من الاتصال بقاعدة البيانات
        db.session.execute('SELECT 1')
        return jsonify({
            'status': 'healthy',
            'message': 'التطبيق يعمل بشكل طبيعي'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'message': str(e)
        }), 503


# معالج الأخطاء 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'الصفحة غير موجودة'}), 404

# معالج الأخطاء 500
@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'خطأ في الخادم'}), 500

# تسجيل المسارات من الملفات الأخرى
from routes.admin import admin_bp
from routes.reseller import reseller_bp
from routes.users import users_bp

if admin_bp:
    app.register_blueprint(admin_bp, url_prefix='/admin')
if reseller_bp:
    app.register_blueprint(reseller_bp, url_prefix='/reseller')
if users_bp:
    # تسجيل routes المستخدمين بدون prefix حتى تعمل الـ routes الأساسية
    app.register_blueprint(users_bp)


# ============================================================================
# Socket.IO Events for Real-time Messages
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """عند الاتصال بـ Socket.IO"""
    user_id = session.get('admin_id') or session.get('reseller_id')
    user_type = 'admin' if session.get('admin_id') else 'reseller'
    print(f'✓ {user_type} connected: {user_id}')


@socketio.on('disconnect')
def handle_disconnect():
    """عند قطع الاتصال"""
    user_id = session.get('admin_id') or session.get('reseller_id')
    print(f'✗ User disconnected: {user_id}')


@socketio.on('join_ticket')
def on_join_ticket(data):
    """الانضمام إلى غرفة التذكرة"""
    ticket_id = data.get('ticket_id')
    room = f'ticket_{ticket_id}'
    join_room(room)
    emit('status', {
        'msg': 'انضم المستخدم إلى المحادثة',
        'timestamp': datetime.utcnow().isoformat()
    }, room=room)


@socketio.on('send_message')
def handle_message(data):
    """بث الرسالة المحفوظة بالفعل عبر API إلى جميع الأطراف في الغرفة"""
    try:
        ticket_id = data.get('ticket_id')
        message_text = data.get('message')
        is_internal = data.get('is_internal', False)
        
        user_id = session.get('admin_id') or session.get('reseller_id')
        user_type = 'admin' if session.get('admin_id') else 'reseller'
        
        if not ticket_id or not message_text or not user_id:
            emit('error', {'msg': 'Invalid data'})
            return
        
        # ✅ الرسالة محفوظة بالفعل عبر API
        # هنا نبثها فقط إلى جميع المتصلين في الغرفة
        room = f'ticket_{ticket_id}'
        
        # بث الرسالة إلى جميع المتصلين في الغرفة
        emit('new_message', {
            'ticket_id': ticket_id,
            'sender_type': user_type,
            'sender_id': user_id,
            'message': message_text,
            'is_internal': is_internal,
            'created_at': datetime.utcnow().isoformat()
        }, room=room)
        
        print(f'✅ Message broadcasted to room: {room}')
    
    except Exception as e:
        print(f'❌ Error in send_message: {str(e)}')
        emit('error', {'msg': str(e)})


if __name__ == '__main__':
    with app.app_context():
        # إنشاء جداول قاعدة البيانات
        db.create_all()
        
        # محاولة إضافة بيانات تجريبية
        from init_db import init_db_with_sample_data
        try:
            init_db_with_sample_data(app, db)
        except Exception as e:
            print(f"⚠️ تحذير أثناء تهيئة البيانات: {e}")
    
    # تشغيل التطبيق
    app.run(debug=True, host='0.0.0.0', port=5000)

