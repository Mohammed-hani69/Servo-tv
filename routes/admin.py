"""
المسارات الخاصة بالمسؤولين
"""
from flask import Blueprint, render_template, jsonify , make_response
from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import check_password_hash, generate_password_hash
from models import Admin, Reseller, ResellerTopUp, AuditLog, SupportTicket, TicketMessage, db
from functools import wraps
import random
import string
import os
from datetime import datetime
from audit_helper import log_admin_action, log_reseller_action
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from xhtml2pdf import pisa

#======================================================
#======================================================
#======================================================

admin_bp = Blueprint('admin', __name__)

def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect(url_for('admin.login'))
        return f(*args, **kwargs)
    return decorated_function

#======================================================
#======================================================
#======================================================


@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        admin = Admin.query.filter_by(email=email).first()

        if not admin or not check_password_hash(admin.password_hash, password):
            flash('Invalid email or password', 'danger')
            return redirect(url_for('admin.login'))

        # حفظ بيانات الأدمن في السيشن
        session['admin_id'] = admin.id
        session['admin_role'] = admin.role
        
        # تسجيل العملية
        log_admin_action(
            action='login',
            description=f'Admin {admin.username} logged in',
            resource_type='admin',
            resource_id=admin.id
        )

        return redirect(url_for('admin.dashboard'))

    return render_template('admin/login.html')


@admin_bp.route('/logout', methods=['GET', 'POST'])
def logout():
    admin_id = session.get('admin_id')
    if admin_id:
        log_admin_action(
            action='logout',
            description=f'Admin logged out'
        )
    session.clear()
    return redirect(url_for('admin.login'))

#======================================================
#======================================================


@admin_bp.route('/dashboard')
@admin_login_required
def dashboard():
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from models import User, Device
    
    # عدد الموزعين
    total_resellers = Reseller.query.count()
    
    # عدد المستخدمين الكلي
    total_users = User.query.count()
    
    # عدد الأجهزة النشطة
    active_devices = Device.query.filter_by(is_active=True, is_deleted=False).count()
    
    # المبلغ الإجمالي المباع خلال الشهر الحالي
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = db.session.query(func.sum(ResellerTopUp.amount_usd)).filter(
        ResellerTopUp.created_at >= current_month_start
    ).scalar() or 0
    
    return render_template(
        'admin/dashboard.html',
        total_users=total_users,
        total_resellers=total_resellers,
        active_devices=active_devices,
        monthly_revenue=round(monthly_revenue, 2)
    )



@admin_bp.route('/api/analytics/revenue', methods=['GET'])
@admin_login_required
def analytics_revenue():
    """
    احصائيات الإيرادات حسب الفترة الزمنية
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    period = request.args.get('period', 'month')  # day, week, month, year
    
    now = datetime.now()
    
    # تحديد نقطة البداية حسب الفترة
    if period == 'day':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        group_format = '%H:00'  # بالساعة
        label_format = '%H:%M'
    elif period == 'week':
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        group_format = '%Y-%m-%d'
        label_format = '%a'  # اسم اليوم
    elif period == 'year':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        group_format = '%Y-%m'
        label_format = '%b'  # اسم الشهر
    else:  # month
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        group_format = '%Y-%m-%d'
        label_format = '%d'
    
    # استعلام البيانات من قاعدة البيانات
    revenue_data = db.session.query(
        func.strftime(group_format, ResellerTopUp.created_at).label('date'),
        func.sum(ResellerTopUp.amount_usd).label('amount'),
        func.sum(ResellerTopUp.points).label('points')
    ).filter(
        ResellerTopUp.created_at >= start_date
    ).group_by(
        func.strftime(group_format, ResellerTopUp.created_at)
    ).order_by('date').all()
    
    # معالجة النتائج
    labels = []
    amounts = []
    points = []
    
    for row in revenue_data:
        # تحويل التاريخ إلى التنسيق المطلوب للعرض
        try:
            if period == 'day':
                # تحويل من "HH:00" إلى "HH" (مثل 00, 01, 02, ... 23)
                hour = row.date.split(':')[0] if ':' in row.date else row.date
                labels.append(hour)
            elif period == 'week':
                # تحويل التاريخ إلى اسم اليوم (مثل Mon, Tue, إلخ)
                from datetime import datetime
                date_obj = datetime.strptime(row.date, '%Y-%m-%d')
                labels.append(date_obj.strftime('%a'))
            elif period == 'month':
                # تحويل التاريخ إلى اليوم (1, 2, 3, ...)
                from datetime import datetime
                date_obj = datetime.strptime(row.date, '%Y-%m-%d')
                labels.append(date_obj.strftime('%d'))
            elif period == 'year':
                # تحويل التاريخ إلى اسم الشهر (Jan, Feb, إلخ)
                from datetime import datetime
                date_obj = datetime.strptime(row.date, '%Y-%m')
                labels.append(date_obj.strftime('%b'))
        except:
            labels.append(row.date)
        
        amounts.append(float(row.amount) if row.amount else 0)
        points.append(int(row.points) if row.points else 0)
    
    return jsonify({
        'success': True,
        'period': period,
        'labels': labels,
        'amounts': amounts,
        'points': points,
        'total_amount': sum(amounts),
        'total_points': sum(points)
    })


@admin_bp.route('/resellers')
@admin_login_required
def resellers():
    # جلب كل الموزعين من قاعدة البيانات
    all_resellers = Reseller.query.all()
    return render_template('admin/resellers.html', resellers=all_resellers)



@admin_bp.route('/api/resellers/create', methods=['POST'])
def create_reseller():
    """
    إنشاء موزع جديد من خلال API
    """
    # التحقق من الجلسة
    if 'admin_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Unauthorized: Please login first'
        }), 401
    
    try:
        # محاولة الحصول على البيانات من JSON
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Invalid JSON format. Please check your request.'
            }), 400
        
        if data is None:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # التحقق من البيانات المطلوبة
        required_fields = ['name', 'email', 'password', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
            
            if not data[field] or str(data[field]).strip() == '':
                return jsonify({
                    'success': False,
                    'message': f'Field "{field}" cannot be empty'
                }), 400
        
        # التحقق من صيغة البريد الإلكتروني
        email = str(data['email']).strip().lower()
        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        # التحقق من أن البريد الإلكتروني لم يكن مستخدماً من قبل
        existing_reseller = Reseller.query.filter_by(email=email).first()
        if existing_reseller:
            return jsonify({
                'success': False,
                'message': 'Email already exists in the system'
            }), 409
        
        # التحقق من طول كلمة المرور
        password = str(data['password']).strip()
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # إنشاء موزع جديد
        new_reseller = Reseller(
            name=str(data['name']).strip(),
            email=email,
            password_hash=generate_password_hash(password),
            country=str(data['country']).strip(),
            points_balance=0,
            is_active=True,
            total_amount_charged=0,
            total_points_charged=0
        )
        
        db.session.add(new_reseller)
        db.session.commit()
        
        # تسجيل العملية
        log_admin_action(
            action='create',
            description=f'Created new reseller: {new_reseller.name} ({new_reseller.email})',
            resource_type='reseller',
            resource_id=new_reseller.id
        )
        
        return jsonify({
            'success': True,
            'message': 'Reseller created successfully',
            'reseller': {
                'id': new_reseller.id,
                'name': new_reseller.name,
                'email': new_reseller.email,
                'country': new_reseller.country
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

#

@admin_bp.route('/api/resellers/toggle/<int:reseller_id>', methods=['PUT'])
@admin_login_required
def toggle_reseller_status(reseller_id):
    """
    تفعيل أو تعطيل حساب الموزع
    """
    try:
        reseller = Reseller.query.get(reseller_id)
        
        if not reseller:
            return jsonify({
                'success': False,
                'message': 'Reseller not found'
            }), 404
        
        data = request.get_json(force=True, silent=True)
        
        if data is None or 'is_active' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request data'
            }), 400
        
        # تبديل حالة الموزع
        reseller.is_active = data['is_active']
        db.session.commit()
        
        # تسجيل العملية
        action = 'activate' if data['is_active'] else 'deactivate'
        log_admin_action(
            action=action,
            description=f'Reseller {reseller.name} has been {"activated" if data["is_active"] else "deactivated"}',
            resource_type='reseller',
            resource_id=reseller.id
        )
        
        return jsonify({
            'success': True,
            'message': f'Reseller status updated successfully',
            'is_active': reseller.is_active
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ خطأ في تحديث حالة الموزع: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500



@admin_bp.route('/resellers/topup/<int:reseller_id>', methods=['GET', 'POST'])
@admin_login_required
def reseller_topup(reseller_id):
    reseller = Reseller.query.get_or_404(reseller_id)

    if request.method == 'POST':
        points = int(request.form['points'])
        amount_usd = float(request.form['amount'])

        # توليد رقم فاتورة عشوائي
        invoice_number = 'SERVO-INV-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

        topup = ResellerTopUp(
            reseller_id=reseller.id,
            points=points,
            amount_usd=amount_usd,
            invoice_number=invoice_number
        )
        
        # تحديث رصيد الموزع
        reseller.points_balance += points
        
        # تحديث المبلغ الإجمالي والنقاط الإجمالية
        reseller.total_amount_charged += amount_usd
        reseller.total_points_charged += points

        db.session.add(topup)
        db.session.commit()

        # توليد وحفظ الفاتورة
        save_invoice_pdf(topup, reseller)
        
        # تسجيل العملية
        log_admin_action(
            action='topup',
            description=f'Reseller {reseller.name} was topped up with {points} points (${amount_usd:.2f}). Invoice: {invoice_number}',
            resource_type='reseller',
            resource_id=reseller.id
        )

        flash(f'Successfully topped up {points} points for {reseller.name}. Invoice: {invoice_number}', 'success')
        return redirect(url_for('admin.resellers'))

    return render_template('admin/components/reseller_topup.html', reseller=reseller)


def save_invoice_pdf(topup, reseller):
    """حفظ الفاتورة كملف PDF باستخدام تصميم احترافي"""
    try:
        # المسار: static/invoices/YYYY/MM/DD/
        year = topup.created_at.strftime('%Y')
        month = topup.created_at.strftime('%m')
        day = topup.created_at.strftime('%d')
        
        invoices_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'static', 'invoices', year, month, day
        )
        
        # إنشاء الفولدرات إن لم تكن موجودة
        if not os.path.exists(invoices_dir):
            os.makedirs(invoices_dir)
        
        # تحضير بيانات الفاتورة
        invoice_html = render_template('admin/components/invoice.html',
            invoice_number=topup.invoice_number,
            reseller_name=reseller.name,
            reseller_email=reseller.email,
            invoice_date=topup.created_at.strftime('%B %d, %Y'),
            points=topup.points,
            amount_usd=f'{topup.amount_usd:.2f}'
        )
        
        # حفظ الملف
        file_path = os.path.join(invoices_dir, f'{topup.invoice_number}.pdf')
        result_file = open(file_path, 'w+b')
        pisa.CreatePDF(invoice_html, result_file)
        result_file.close()
        
        # حفظ مسار الفاتورة في قاعدة البيانات بصيغة ويب
        relative_path = f'invoices/{year}/{month}/{day}/{topup.invoice_number}.pdf'
        topup.invoice_path = relative_path
        db.session.commit()
        
        print(f'✅ Invoice generated: {topup.invoice_number}')
        return True
    except Exception as e:
        print(f'❌ Invoice generation error: {str(e)}')
        # محاولة حفظ المسار حتى لو فشل توليد PDF
        try:
            year = topup.created_at.strftime('%Y')
            month = topup.created_at.strftime('%m')
            day = topup.created_at.strftime('%d')
            relative_path = f'invoices/{year}/{month}/{day}/{topup.invoice_number}.pdf'
            topup.invoice_path = relative_path
            db.session.commit()
        except:
            pass
        return False


@admin_bp.route('/invoice/<int:topup_id>')
@admin_bp.route('/invoice/<int:topup_id>/<action>')
@admin_login_required
def generate_invoice(topup_id, action='download'):
    topup = ResellerTopUp.query.get(topup_id)
    
    if not topup:
        return jsonify({
            'success': False,
            'error': 'Invoice not found'
        }), 404
    
    # تسجيل العملية
    log_admin_action(
        action=action,
        description=f'Invoice {topup.invoice_number} was {action}ed',
        resource_type='invoice',
        resource_id=topup.id
    )
    # استخدام المسار المحفوظ في قاعدة البيانات
    if topup.invoice_path:
        # تحويل المسار من forward slash إلى backslash لـ Windows
        file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'static', topup.invoice_path.replace('/', os.sep)
        )
    else:
        # للفاتورات القديمة التي لا تملك invoice_path
        year = topup.created_at.strftime('%Y')
        month = topup.created_at.strftime('%m')
        day = topup.created_at.strftime('%d')
        
        invoices_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'static', 'invoices', year, month, day
        )
        file_path = os.path.join(invoices_dir, f'{topup.invoice_number}.pdf')
    
    # إذا كان الملف موجوداً، اقرأه مباشرة
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            pdf_content = f.read()
    else:
        # وإلا قم بتوليده
        reseller = topup.reseller
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        title = Paragraph(f"<b>Invoice</b>", styles['Heading1'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        invoice_info = [
            ['Invoice Number:', topup.invoice_number],
            ['Date:', topup.created_at.strftime('%Y-%m-%d %H:%M')],
            ['Reseller:', reseller.name],
            ['Email:', reseller.email],
        ]
        
        table = Table(invoice_info)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 20))
        
        details = [
            ['Description', 'Quantity', 'Amount'],
            ['Points Top Up', f'{topup.points} PTS', f'${topup.amount_usd:.2f}'],
            ['', '', ''],
            ['Total', '', f'${topup.amount_usd:.2f}']
        ]
        
        detail_table = Table(details, colWidths=[300, 100, 100])
        detail_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(detail_table)
        doc.build(elements)
        
        buffer.seek(0)
        pdf_content = buffer.getvalue()
    
    response = make_response(pdf_content)
    response.headers['Content-Type'] = 'application/pdf'
    
    # تحديد نوع الـ disposition حسب الـ action
    if action == 'view':
        response.headers['Content-Disposition'] = f'inline; filename={topup.invoice_number}.pdf'
    else:
        response.headers['Content-Disposition'] = f'attachment; filename={topup.invoice_number}.pdf'
    
    return response


@admin_bp.route('/api/reseller/<int:reseller_id>/last-invoice')
@admin_login_required
def get_last_invoice(reseller_id):
    """الحصول على آخر فاتورة للموزع"""
    topup = ResellerTopUp.query.filter_by(reseller_id=reseller_id).order_by(ResellerTopUp.created_at.desc()).first()
    
    if not topup:
        return jsonify({
            'success': False,
            'message': 'No invoices found for this reseller'
        }), 404
    
    return jsonify({
        'success': True,
        'invoice_id': topup.id,
        'invoice_number': topup.invoice_number,
        'invoice_path': topup.invoice_path,
        'created_at': topup.created_at.strftime('%Y-%m-%d %H:%M')
    }), 200


@admin_bp.route('/api/audit-logs', methods=['GET'])
@admin_login_required
def get_audit_logs():
        """جلب آخر 4 عمليات من سجل التدقيق"""
        from audit_helper import get_recent_activities, get_activity_description
        
        try:
            limit = request.args.get('limit', 4, type=int)
            activities = get_recent_activities(limit=limit)
            
            # إضافة وصف نصي لكل عملية
            for activity in activities:
                activity['description_text'] = get_activity_description(activity)
            
            return jsonify({
                'success': True,
                'activities': activities
            }), 200
            
        except Exception as e:
            print(f"❌ خطأ في جلب السجلات: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error: {str(e)}'
            }), 500
        


#======================================================
#======================================================

@admin_bp.route('/audit-logs')
@admin_login_required
def audit_logs():
    """عرض صفحة السجلات الأمنية مع جميع البيانات"""
    try:
        # جلب جميع سجلات التدقيق مع الترتيب من الأحدث
        all_logs = AuditLog.query.order_by(AuditLog.created_at.desc()).all()
        
        # إحصائيات
        failed_logins = len([log for log in all_logs if log.action == 'FAILED_LOGIN'])
        
        # حساب أعلى الأماكن بناءً على عنوان IP
        ip_locations = {}
        for log in all_logs:
            if log.ip_address:
                ip_locations[log.ip_address] = ip_locations.get(log.ip_address, 0) + 1
        
        top_locations = sorted(ip_locations.items(), key=lambda x: x[1], reverse=True)[:3]
        top_locations_str = ', '.join([ip[0] for ip in top_locations]) if top_locations else 'Unknown'
        
        return render_template(
            'admin/Securitylogs.html',
            audit_logs=all_logs,
            failed_logins=failed_logins,
            top_locations=top_locations_str
        )
    except Exception as e:
        print(f"❌ خطأ في جلب السجلات: {str(e)}")
        flash('Error loading audit logs', 'danger')
        return redirect(url_for('admin.dashboard'))


#======================================================
#======================================================


@admin_bp.route('/settings', methods=['GET', 'POST'])
@admin_login_required
def settings():
    admin_id = session.get('admin_id')
    admin = Admin.query.get_or_404(admin_id)

    if request.method == 'POST':
        # تحديث الإعدادات
        new_email = request.form.get('email')
        new_password = request.form.get('password')
        
        if new_email:
            admin.email = new_email.strip().lower()
        
        if new_password:
            if len(new_password) < 6:
                flash('Password must be at least 6 characters long', 'danger')
                return redirect(url_for('admin.settings'))
            admin.password_hash = generate_password_hash(new_password.strip())
        
        db.session.commit()
        
        # تسجيل العملية
        log_admin_action(
            action='update_settings',
            description=f'Admin {admin.username} updated their settings',
            resource_type='admin',
            resource_id=admin.id
        )
        
        flash('Settings updated successfully', 'success')
        return redirect(url_for('admin.settings'))

    return render_template('admin/settings.html', admin=admin)

@admin_bp.route('/api/admin/change-password', methods=['POST'])
@admin_login_required
def change_admin_password():
    """
    تغيير كلمة مرور الأدمن من خلال API
    """
    admin_id = session.get('admin_id')
    admin = Admin.query.get_or_404(admin_id)
    
    try:
        data = request.get_json(force=True)
        
        if 'current_password' not in data or 'new_password' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        current_password = data['current_password'].strip()
        new_password = data['new_password'].strip()
        
        # التحقق من كلمة المرور الحالية
        if not check_password_hash(admin.password_hash, current_password):
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect'
            }), 401
        
        # التحقق من طول كلمة المرور الجديدة
        if len(new_password) < 6:
            return jsonify({
                'success': False,
                'message': 'New password must be at least 6 characters long'
            }), 400
        
        # تحديث كلمة المرور
        admin.password_hash = generate_password_hash(new_password)
        db.session.commit()
        
        # تسجيل العملية
        log_admin_action(
            action='change_password',
            description=f'Admin {admin.username} changed their password',
            resource_type='admin',
            resource_id=admin.id
        )
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500
    

#=====================================================
#=====================================================

@admin_bp.route('/support')
@admin_login_required
def support():
    """صفحة الدعم للمسؤول - تحميل جميع التذاكر والبيانات المرتبطة بها"""
    try:
        # جلب جميع التذاكر مرتبة بحسب تاريخ الإنشاء
        tickets = SupportTicket.query.order_by(SupportTicket.created_at.desc()).all()
        
        # تحضير بيانات التذاكر للعرض
        tickets_data = []
        for ticket in tickets:
            reseller = Reseller.query.get(ticket.reseller_id)
            
            # جلب الرسائل المرتبطة بالتذكرة
            messages = []
            if ticket.messages:
                for msg in ticket.messages:
                    messages.append({
                        'id': msg.id,
                        'sender_type': msg.sender_type,
                        'sender_id': msg.sender_id,
                        'message': msg.message,
                        'is_internal': msg.is_internal,
                        'created_at': msg.created_at.isoformat() if msg.created_at else None
                    })
            
            tickets_data.append({
                'id': ticket.id,
                'ticket_number': ticket.ticket_number,
                'subject': ticket.subject,
                'description': ticket.description,
                'priority': ticket.priority,
                'status': ticket.status,
                'reseller_id': ticket.reseller_id,
                'reseller_name': reseller.name if reseller else 'Unknown',
                'reseller_email': reseller.email if reseller else 'Unknown',
                'created_at': ticket.created_at.isoformat() if ticket.created_at else None,
                'updated_at': ticket.updated_at.isoformat() if ticket.updated_at else None,
                'resolved_at': ticket.resolved_at.isoformat() if ticket.resolved_at else None,
                'messages': messages,
                'message_count': len(messages)
            })
        
        return render_template('admin/support.html', tickets=tickets_data)
    
    except Exception as e:
        print(f"Error in support route: {str(e)}")
        return render_template('admin/support.html', tickets=[])


# ============================================================================
# 🎫 Support Tickets API for Admins (مرتبط بصفحة /support)
# ============================================================================
# ملاحظة: البيانات الأساسية للتذاكر تُحمَّل من route /support
# هذه الـ routes للعمليات الديناميكية فقط (إرسال رسائل، تحديث الحالة)


@admin_bp.route('/api/tickets/<int:ticket_id>/update-status', methods=['POST'])
@admin_login_required
def update_ticket_status(ticket_id):
    """تحديث حالة التذكرة"""
    try:
        ticket = SupportTicket.query.get(ticket_id)
        
        if not ticket:
            return jsonify({'success': False, 'message': 'Ticket not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status', '').strip()
        
        if new_status not in ['open', 'in_progress', 'closed']:
            return jsonify({'success': False, 'message': 'Invalid status'}), 400
        
        ticket.status = new_status
        ticket.updated_at = datetime.utcnow()
        
        if new_status == 'closed':
            ticket.resolved_at = datetime.utcnow()
        
        db.session.commit()
        
        # تسجيل العملية
        log_admin_action(
            action='update_ticket',
            description=f'Updated ticket {ticket.ticket_number} status to {new_status}',
            resource_type='support_ticket',
            resource_id=ticket.id
        )
        
        return jsonify({
            'success': True,
            'message': 'Ticket status updated successfully'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/api/tickets/<int:ticket_id>/message', methods=['POST'])
@admin_login_required
def add_admin_message(ticket_id):
    """إضافة رسالة من الادمن إلى التذكرة"""
    try:
        admin_id = session.get('admin_id')
        ticket = SupportTicket.query.get(ticket_id)
        
        if not ticket:
            return jsonify({'success': False, 'message': 'Ticket not found'}), 404
        
        data = request.get_json()
        message_text = data.get('message', '').strip()
        is_internal = data.get('is_internal', False)
        
        if not message_text:
            return jsonify({'success': False, 'message': 'Message cannot be empty'}), 400
        
        # إنشاء الرسالة
        message = TicketMessage(
            ticket_id=ticket_id,
            sender_type='admin',
            sender_id=admin_id,
            message=message_text,
            is_internal=is_internal
        )
        
        db.session.add(message)
        ticket.updated_at = datetime.utcnow()
        db.session.commit()
        
        # تسجيل العملية
        log_admin_action(
            action='add_message',
            description=f'Added message to ticket {ticket.ticket_number}',
            resource_type='support_ticket',
            resource_id=ticket.id
        )
        
        return jsonify({
            'success': True,
            'message': 'Message added successfully',
            'data': {
                'id': message.id,
                'sender_type': message.sender_type,
                'sender_id': message.sender_id,
                'message': message.message,
                'is_internal': message.is_internal,
                'created_at': message.created_at.isoformat() if message.created_at else None
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

#====================================================
#====================================================

@admin_bp.route('/Financials')
@admin_login_required
def Financials():
    return render_template('admin/financials.html')

#===================================================
#===================================================

@admin_bp.route('/notifications')
@admin_login_required
def notifications():
    return render_template('admin/notifications.html')

#===================================================
#===================================================

@admin_bp.route('/plans')
@admin_login_required
def plans():
    return render_template('admin/plans.html')

#===================================================
#===================================================
@admin_bp.route('/Billing')
@admin_login_required
def Billing():
    return render_template('admin/Billing.html')

#===================================================
#===================================================
@admin_bp.route('/reports')
@admin_login_required
def reports():
    return render_template('admin/reports.html')

#===================================================
#===================================================
@admin_bp.route('/Roles')
@admin_login_required
def Roles():
    return render_template('admin/Roles.html')

#===================================================
#===================================================
@admin_bp.route('/logs')
@admin_login_required
def logs():
    return render_template('admin/logs.html')