from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# تهيئة قاعدة البيانات
db = SQLAlchemy()

# ----------------------
# Base Model
# ----------------------
class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ----------------------
# Users (مستخدمين عاديين بدون باسورد أو ايميل)
# ----------------------
class User(BaseModel):
    __tablename__ = 'users'

    username = db.Column(db.String(50), unique=True, nullable=False)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)

    # Relationships
    reseller = db.relationship('Reseller', back_populates='users')
    devices = db.relationship('Device', back_populates='user', cascade="all, delete-orphan")
    activation_codes = db.relationship('ActivationCode', back_populates='assigned_user', cascade="all, delete-orphan")
    device_activation_codes = db.relationship('DeviceActivationCode', back_populates='user', cascade="all, delete-orphan")

# ----------------------
# Resellers (يمتلك ايميل وباسورد)
# ----------------------
class Reseller(BaseModel):
    __tablename__ = 'resellers'

    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    pin_hash = db.Column(db.String(255), nullable=True)
    points_balance = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    total_amount_charged = db.Column(db.Float, default=0)
    total_points_charged = db.Column(db.Integer, default=0)

    # Relationships
    users = db.relationship('User', back_populates='reseller', cascade="all, delete-orphan")
    activation_codes = db.relationship('ActivationCode', back_populates='reseller', cascade="all, delete-orphan")
    device_activation_codes = db.relationship('DeviceActivationCode', back_populates='reseller', cascade="all, delete-orphan")

# ----------------------
# Admins (يشبه الموزع)
# ----------------------
class Admin(BaseModel):
    __tablename__ = 'admins'

    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='admin', nullable=False)

#----------------------
# Reseller Top-Ups (شحن رصيد الموزع)
#----------------------

class ResellerTopUp(db.Model):
    __tablename__ = 'reseller_topups'

    id = db.Column(db.Integer, primary_key=True)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    amount_usd = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    invoice_path = db.Column(db.String(255), nullable=True)  # مسار الفاتورة

    # العلاقة مع الموزع
    reseller = db.relationship('Reseller', back_populates='topups')

# ربط الـ Reseller مع topups
Reseller.topups = db.relationship('ResellerTopUp', back_populates='reseller', cascade="all, delete-orphan")


# ----------------------
# Activation Codes (اشتراكات)
# ----------------------
class ActivationCode(BaseModel):
    __tablename__ = 'activation_codes'

    code = db.Column(db.String(50), unique=True, nullable=False)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    duration_months = db.Column(db.Integer, nullable=False)
    max_devices = db.Column(db.Integer, nullable=False, default=1)
    is_lifetime = db.Column(db.Boolean, default=False)  # True if lifetime, False if 1 year
    activated_at = db.Column(db.DateTime, nullable=True)
    expiration_date = db.Column(db.DateTime, nullable=True)

    # Relationships
    reseller = db.relationship('Reseller', back_populates='activation_codes')
    assigned_user = db.relationship('User', back_populates='activation_codes')

# ----------------------
# Device Activation Codes
# ----------------------
class DeviceActivationCode(BaseModel):
    __tablename__ = 'device_activation_codes'

    activation_code = db.Column(db.String(50), nullable=False)
    device_id = db.Column(db.String(100), nullable=False)
    device_type = db.Column(db.String(50), nullable=True)
    username = db.Column(db.String(50), nullable=True)

    is_used = db.Column(db.Boolean, default=False)
    used_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)

    activated_by_reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Relationships
    reseller = db.relationship('Reseller', back_populates='device_activation_codes')
    user = db.relationship('User', back_populates='device_activation_codes')

# ----------------------
# Devices
# ----------------------
class Device(BaseModel):
    __tablename__ = 'devices'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_uid = db.Column(db.String(100), unique=True, nullable=False)
    device_name = db.Column(db.String(100), nullable=True)
    device_type = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    first_login_at = db.Column(db.DateTime, nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    last_ip = db.Column(db.String(45), nullable=True)
    media_link = db.Column(db.Text, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)

    # Relationships
    user = db.relationship('User', back_populates='devices')
    playlists = db.relationship('UserPlaylist', back_populates='device', cascade="all, delete-orphan")

# ----------------------
# User Playlists (البلايليست المتعددة للمستخدم)
# ----------------------
class UserPlaylist(BaseModel):
    __tablename__ = 'user_playlists'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    media_link = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    reseller_playlist = db.Column(db.Text, nullable=True)  # البلايليست الاختياري من الموزع

    # Relationships
    user = db.relationship('User', back_populates='playlists')
    device = db.relationship('Device', back_populates='playlists')

# إضافة العلاقة مع User
User.playlists = db.relationship('UserPlaylist', back_populates='user', cascade="all, delete-orphan")

# ----------------------
# Support Tickets (تذاكر الدعم)
# ----------------------
class SupportTicket(BaseModel):
    __tablename__ = 'support_tickets'

    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='open', nullable=False)  # open, in_progress, closed
    priority = db.Column(db.String(20), default='normal', nullable=False)  # low, normal, high, urgent
    assigned_to = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    reseller = db.relationship('Reseller', back_populates='support_tickets')
    messages = db.relationship('TicketMessage', back_populates='ticket', cascade="all, delete-orphan")
    admin = db.relationship('Admin', back_populates='assigned_tickets')

# إضافة العلاقة مع Reseller و Admin
Reseller.support_tickets = db.relationship('SupportTicket', back_populates='reseller', cascade="all, delete-orphan")
Admin.assigned_tickets = db.relationship('SupportTicket', back_populates='admin')

# ----------------------
# Support Ticket Messages (رسائل التذاكر)
# ----------------------
class TicketMessage(BaseModel):
    __tablename__ = 'ticket_messages'

    ticket_id = db.Column(db.Integer, db.ForeignKey('support_tickets.id'), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False)  # reseller, admin
    sender_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False)  # رسالة داخلية للموظفين فقط

    # Relationships
    ticket = db.relationship('SupportTicket', back_populates='messages')

# ----------------------
# Audit Log
# ----------------------
class AuditLog(BaseModel):
    __tablename__ = 'audit_log'

    actor_type = db.Column(db.Enum('user','reseller','admin', name='actor_types'), nullable=False)
    actor_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
