import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation & Sidebar
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_mylist: { en: "My List", ar: "قائمتي" },
  nav_livetv: { en: "Live TV", ar: "بث مباشر" },
  nav_movies: { en: "Movies", ar: "أفلام" },
  nav_series: { en: "Series", ar: "مسلسلات" },
  nav_profile: { en: "Profile", ar: "الملف الشخصي" },
  nav_settings: { en: "Settings", ar: "الإعدادات" },
  nav_logout: { en: "LOGOUT", ar: "خروج" },

  // Admin Sidebar
  admin_overview: { en: "Overview", ar: "نظرة عامة" },
  admin_distributors: { en: "Distributors", ar: "الموزعين" },
  admin_subscribers: { en: "Subscribers", ar: "المشتركين" },
  admin_devices: { en: "Devices", ar: "الأجهزة" },
  admin_plans: { en: "Plans & Pricing", ar: "الخطط والأسعار" },
  admin_codes: { en: "Activation Codes", ar: "أكواد التفعيل" },
  admin_points: { en: "Points System", ar: "نظام النقاط" },
  admin_billing: { en: "Billing", ar: "الفواتير" },
  admin_support: { en: "Support & Tickets", ar: "الدعم والتذاكر" },
  admin_notifications: { en: "Notifications", ar: "الإشعارات" },
  admin_reports: { en: "Reports & Analytics", ar: "التقارير والتحليلات" },
  admin_roles: { en: "Roles & Perms", ar: "الصلاحيات والأدوار" },
  admin_security: { en: "Security & Logs", ar: "الأمان والسجلات" },
  admin_settings: { en: "System Settings", ar: "إعدادات النظام" },
  admin_financials: { en: "Financials (Partners)", ar: "المالية (الشركاء)" },
  admin_panel_title: { en: "Admin Panel", ar: "لوحة الإدارة" },
  super_admin: { en: "Super Admin", ar: "مسؤول عام" },

  // Admin Dashboard
  system_overview: { en: "System Overview", ar: "نظرة عامة على النظام" },
  system_healthy: { en: "System Healthy", ar: "النظام يعمل بكفاءة" },
  total_users: { en: "Total Users", ar: "إجمالي المستخدمين" },
  active_devices: { en: "Active Devices", ar: "الأجهزة النشطة" },
  monthly_revenue: { en: "Monthly Revenue", ar: "الإيرادات الشهرية" },
  revenue_analytics: { en: "Revenue Analytics", ar: "تحليلات الإيرادات" },
  recent_alerts: { en: "Recent Alerts", ar: "تنبيهات حديثة" },
  alert_login_spike: { en: "Failed Login Spike", ar: "ارتفاع في محاولات الدخول الفاشلة" },
  alert_login_spike_desc: { en: "Multiple failed attempts from IP 192.168.x.x", ar: "محاولات فاشلة متعددة من IP 192.168.x.x" },

  // Partner Financials
  partner_dashboard_title: { en: "System Revenue & Profit", ar: "إيرادات وأرباح النظام" },
  partner_dashboard_desc: { en: "Read-only financial ledger. Data integrity secured by hash chaining.", ar: "سجل مالي للقراءة فقط. نزاهة البيانات مؤمنة بتسلسل الهاش." },
  total_sales: { en: "Total Sales", ar: "إجمالي المبيعات" },
  total_profit: { en: "Total Profit", ar: "إجمالي الأرباح" },
  net_profit: { en: "Net Profit", ar: "صافي الربح" },
  total_subscriptions: { en: "Total Subscriptions", ar: "إجمالي الاشتراكات" },
  total_points_sold: { en: "Total Points Sold", ar: "النقاط المباعة" },
  ledger_integrity: { en: "Ledger Integrity Verified", ar: "تم التحقق من نزاهة السجل" },
  ledger_tampered: { en: "Ledger Tampered", ar: "تم التلاعب بالسجل" },
  export_report: { en: "Export Report", ar: "تصدير التقرير" },
  revenue_breakdown: { en: "Revenue Breakdown", ar: "توزيع الإيرادات" },
  by_month: { en: "By Month", ar: "شهرياً" },
  by_gateway: { en: "By Gateway", ar: "بوابة الدفع" },
  by_distributor: { en: "By Distributor", ar: "الموزع" },
  by_country: { en: "By Country", ar: "الدولة" },
  ledger_hash: { en: "Ledger Hash", ar: "هاش السجل" },
  transaction_id: { en: "Transaction ID", ar: "رقم المعاملة" },
  gateway: { en: "Gateway", ar: "البوابة" },

  // Admin Support
  support_center: { en: "Support Center", ar: "مركز الدعم الفني" },
  support_desc: { en: "Manage tickets from distributors", ar: "إدارة تذاكر الدعم من الموزعين" },
  search_tickets: { en: "Search tickets...", ar: "بحث في التذاكر..." },
  internal_notes: { en: "Internal Notes", ar: "ملاحظات داخلية" },
  internal_notes_desc: { en: "Visible only to admins", ar: "مرئية للمشرفين فقط" },
  internal_notes_placeholder: { en: "Add hidden notes for staff...", ar: "أضف ملاحظات مخفية للموظفين..." },
  save_note: { en: "Save Note", ar: "حفظ الملاحظة" },
  ticket_reply: { en: "Reply to Ticket", ar: "الرد على التذكرة" },
  send_reply: { en: "Send Reply", ar: "إرسال الرد" },
  priority_high: { en: "High", ar: "عالية" },
  priority_medium: { en: "Medium", ar: "متوسطة" },
  priority_low: { en: "Low", ar: "منخفضة" },
  status_open: { en: "Open", ar: "مفتوحة" },
  status_closed: { en: "Closed", ar: "مغلقة" },
  status_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  filter_all: { en: "All", ar: "الكل" },
  select_ticket: { en: "Select a ticket from the list to view details", ar: "اختر تذكرة من القائمة لعرض التفاصيل" },

  // Admin Settings
  global_settings: { en: "Global Settings", ar: "الإعدادات العامة" },
  save_changes: { en: "Save Changes", ar: "حفظ التغييرات" },
  sub_devices_policy: { en: "Subscription & Devices", ar: "الاشتراكات والأجهزة" },
  default_device_limit: { en: "Default Device Limit", ar: "حد الأجهزة الافتراضي" },
  allow_multi_login: { en: "Allow Multi-Device Login", ar: "السماح بتعدد الأجهزة" },
  system_language: { en: "System Language", ar: "لغة النظام" },
  select_language: { en: "Select Language", ar: "اختر اللغة" },
  security_access: { en: "Security & Access", ar: "الأمان والوصول" },
  token_expiration: { en: "Session Token Expiration (Hours)", ar: "مدة انتهاء الجلسة (ساعات)" },
  min_app_version: { en: "Minimum Allowed App Version", ar: "أدنى إصدار مسموح للتطبيق" },
  maintenance_mode: { en: "Maintenance Mode", ar: "وضع الصيانة" },
  maintenance_desc: { en: "Block access for users and resellers", ar: "منع وصول المستخدمين والموزعين" },
  enabled: { en: "ENABLED", ar: "مفعل" },
  disabled: { en: "DISABLED", ar: "معطل" },
  report_settings: { en: "Personal Report Settings", ar: "إعدادات التقارير الشخصية" },
  report_email: { en: "Report Email", ar: "بريد التقرير" },
  report_email_desc: { en: "Email to receive automated system reports (different from login email)", ar: "البريد الإلكتروني لاستلام التقارير التلقائية (يمكن أن يختلف عن بريد الدخول)" },
  report_frequency: { en: "Report Frequency", ar: "تكرار التقرير" },
  daily_report: { en: "Daily Report", ar: "تقرير يومي" },
  weekly_report: { en: "Weekly Report", ar: "تقرير أسبوعي" },
  monthly_report: { en: "Monthly Report", ar: "تقرير شهري" },
  only_one_email_allowed: { en: "You can set one preferred email for your reports.", ar: "يمكنك تعيين بريد إلكتروني واحد مفضل لتقاريرك." },

  // Distributors
  create_distributor: { en: "Create Distributor", ar: "إضافة موزع" },
  manage_resellers: { en: "Manage reseller accounts", ar: "إدارة حسابات الموزعين" },
  search_distributors: { en: "Search distributors...", ar: "بحث عن موزعين..." },
  balance: { en: "Balance", ar: "الرصيد" },
  users: { en: "Users", ar: "مستخدمين" },
  revenue: { en: "Revenue", ar: "إيرادات" },
  actions: { en: "Actions", ar: "إجراءات" },
  distributor_name: { en: "Company / Name", ar: "الشركة / الاسم" },
  email_addr: { en: "Email Address", ar: "البريد الإلكتروني" },
  initial_points: { en: "Initial Points", ar: "النقاط الأولية" },

  // Users
  users_management: { en: "Subscribers Management", ar: "إدارة المشتركين" },
  users_global_view: { en: "Global view of all end-users", ar: "عرض شامل لجميع المستخدمين" },
  search_users_placeholder: { en: "Search users by email, ID...", ar: "بحث بالإيميل أو المعرف..." },
  expires: { en: "Expires", ar: "ينتهي في" },
  status: { en: "Status", ar: "الحالة" },
  devices: { en: "Devices", ar: "الأجهزة" },
  active: { en: "Active", ar: "نشط" },
  suspended: { en: "Suspended", ar: "موقوف" },
  expired: { en: "Expired", ar: "منتهي" },
  reset_devices: { en: "Reset Devices", ar: "إعادة تعيين الأجهزة" },
  suspend_ban: { en: "Suspend/Ban", ar: "إيقاف/حظر" },

  // Devices
  connected_devices: { en: "Connected Devices", ar: "الأجهزة المتصلة" },
  monitoring_sessions: { en: "Real-time monitoring", ar: "مراقبة فورية للجلسات" },
  search_devices: { en: "Search devices...", ar: "بحث في الأجهزة..." },
  device_info: { en: "Device Info", ar: "معلومات الجهاز" },
  last_activity: { en: "Last Activity", ar: "آخر نشاط" },
  block_device: { en: "Block Device", ar: "حظر الجهاز" },

  // Plans
  base_packages: { en: "Base packages for distributors", ar: "الباقات الأساسية للموزعين" },
  create_plan: { en: "Create Plan", ar: "إنشاء خطة" },
  duration: { en: "Duration", ar: "المدة" },
  cost_points: { en: "Cost (Points)", ar: "التكلفة (نقاط)" },
  max_devices: { en: "Max Devices", ar: "أقصى عدد أجهزة" },
  months: { en: "Months", ar: "شهور" },
  plan: { en: "Plan", ar: "الخطة" },

  // Codes
  audit_codes: { en: "Audit trail of generated keys", ar: "سجل تدقيق الأكواد المولدة" },
  search_code: { en: "Search code...", ar: "بحث عن كود..." },
  assigned_to: { en: "Assigned To", ar: "مسند إلى" },
  activation_code: { en: "Activation Code", ar: "رمز التفعيل" },
  
  // Points
  points_system: { en: "Points System", ar: "نظام النقاط" },
  global_pricing: { en: "Global Pricing", ar: "التسعير العالمي" },
  price_per_point: { en: "Price Per Point", ar: "سعر النقطة" },
  transactions_log: { en: "Transactions Log", ar: "سجل المعاملات" },
  configuration: { en: "Configuration", ar: "الإعدادات" },
  enable_automated_bonuses: { en: "Enable Automated Bonuses", ar: "تفعيل المكافآت التلقائية" },
  min_purchase: { en: "Min. Purchase (Points)", ar: "أدنى حد للشراء (نقاط)" },
  bonus_percentage: { en: "Bonus Percentage %", ar: "نسبة المكافأة %" },
  base_price_note: { en: "Changing the base price affects all future purchases. Existing balances remain unchanged.", ar: "تغيير السعر الأساسي يؤثر على المشتريات المستقبلية فقط." },
  bonus_promotions: { en: "Bonus & Promotions", ar: "المكافآت والعروض" },
  search_transactions: { en: "Search transactions...", ar: "بحث في المعاملات..." },
  all_types: { en: "All Types", ar: "كل الأنواع" },
  buy: { en: "Buy", ar: "شراء" },
  bonus: { en: "Bonus", ar: "مكافأة" },
  deduct: { en: "Deduct", ar: "خصم" },
  approver: { en: "Approver", ar: "الموافق" },
  sub_costs_config: { en: "Reseller Subscription Costs", ar: "تكلفة اشتراكات الموزعين" },
  sub_costs_desc: { en: "Define how many points are deducted from the reseller's balance for each subscription duration.", ar: "حدد عدد النقاط التي يتم خصمها من رصيد الموزع لكل مدة اشتراك." },
  cost_1_month: { en: "1 Month Cost", ar: "تكلفة 1 شهر" },
  cost_3_months: { en: "3 Months Cost", ar: "تكلفة 3 أشهر" },
  cost_6_months: { en: "6 Months Cost", ar: "تكلفة 6 أشهر" },
  cost_12_months: { en: "12 Months Cost", ar: "تكلفة 12 شهر" },
  cost_extra_device: { en: "Extra Device Cost (Points)", ar: "تكلفة الجهاز الإضافي (نقاط)" },
  points: { en: "Points", ar: "نقاط" },
  cost_calculator: { en: "Cost Calculator (Preview)", ar: "حاسبة التكلفة (معاينة)" },
  
  // Payments
  payments_billing: { en: "Payments & Billing", ar: "المدفوعات والفواتير" },
  manage_gateways: { en: "Manage gateways", ar: "إدارة بوابات الدفع" },
  transactions: { en: "Transactions", ar: "المعاملات" },
  gateways_settings: { en: "Gateways Settings", ar: "إعدادات البوابات" },
  all_payments: { en: "All Payments", ar: "كل المدفوعات" },
  method: { en: "Method", ar: "الطريقة" },
  amount: { en: "Amount", ar: "القيمة" },
  date: { en: "Date", ar: "التاريخ" },
  approve: { en: "Approve", ar: "موافقة" },
  reject: { en: "Reject", ar: "رفض" },
  invoice: { en: "Invoice", ar: "فاتورة" },
  publishable_key: { en: "Publishable Key", ar: "المفتاح العام (Publishable)" },
  secret_key: { en: "Secret Key", ar: "المفتاح السري (Secret)" },
  webhook_secret: { en: "Webhook Secret", ar: "سر الويب هوك" },
  update_credentials: { en: "Update Credentials", ar: "تحديث البيانات" },
  api_key: { en: "API Key", ar: "مفتاح API" },
  integration_id: { en: "Integration ID", ar: "معرف التكامل" },
  frame_id: { en: "Frame ID", ar: "معرف الإطار" },
  enable_fawry: { en: "Enable Fawry Payments", ar: "تفعيل مدفوعات فوري" },
  manual_bank_transfer: { en: "Manual Bank Transfer", ar: "تحويل بنكي يدوي" },
  instructions_distributors: { en: "Instructions for Distributors", ar: "تعليمات للموزعين" },
  enable_manual_payments: { en: "Enable Manual Payments", ar: "تفعيل الدفع اليدوي" },

  // Notifications
  notifications_center: { en: "Notifications Center", ar: "مركز الإشعارات" },
  broadcast_messages: { en: "Broadcast messages to distributors and users", ar: "بث الرسائل للموزعين والمستخدمين" },
  compose_message: { en: "Compose Message", ar: "إنشاء رسالة" },
  target_audience: { en: "Target Audience", ar: "الجمهور المستهدف" },
  message_type: { en: "Message Type", ar: "نوع الرسالة" },
  message_body: { en: "Message Body", ar: "نص الرسالة" },
  sent_history: { en: "Sent History", ar: "سجل المرسلات" },
  all_distributors: { en: "All Distributors", ar: "كل الموزعين" },
  specific_distributor: { en: "Specific Distributor", ar: "موزع محدد" },
  all_users: { en: "All Users", ar: "كل المستخدمين" },
  brief_subject: { en: "Brief subject...", ar: "موضوع مختصر..." },
  type_message: { en: "Type your message here...", ar: "اكتب رسالتك هنا..." },
  msg_queued: { en: "Message queued for delivery successfully.", ar: "تم وضع الرسالة في قائمة الانتظار بنجاح." },

  // Reports
  deep_insights: { en: "Deep insights into system performance", ar: "رؤى تفصيلية حول أداء النظام" },
  revenue_growth: { en: "Revenue Growth", ar: "نمو الإيرادات" },
  active_vs_expired: { en: "Active Users vs Expired", ar: "المستخدمين النشطين مقابل المنتهية" },
  active_subscribers_report: { en: "Active Subscribers", ar: "المشتركين النشطين" },
  active_subscribers_desc: { en: "List of all currently active users including device details.", ar: "قائمة بجميع المستخدمين النشطين حاليًا بما في ذلك تفاصيل الجهاز." },
  device_locations: { en: "Device Locations", ar: "مواقع الأجهزة" },
  device_locations_desc: { en: "Geographical distribution of logins by country.", ar: "التوزيع الجغرافي لتسجيلات الدخول حسب البلد." },
  revenue_report: { en: "Revenue Report", ar: "تقرير الإيرادات" },
  revenue_report_desc: { en: "Detailed breakdown of points sales and usage.", ar: "تفصيل شامل لمبيعات النقاط والاستخدام." },
  expired_subs: { en: "Expired Subs", ar: "اشتراكات منتهية" },
  expired_subs_desc: { en: "Users who expired in the selected timeframe.", ar: "المستخدمين الذين انتهت صلاحيتهم في الفترة الزمنية المحددة." },
  top_distributors: { en: "Top Performing Distributors", ar: "أفضل الموزعين أداءً" },
  rank: { en: "Rank", ar: "الترتيب" },
  contribution: { en: "Contribution", ar: "المساهمة" },
  trend: { en: "Trend", ar: "الاتجاه" },
  export_excel: { en: "Excel", ar: "إكسل" },
  export_pdf: { en: "PDF", ar: "بي دي إف" },

  // Roles
  roles_perms: { en: "Roles & Permissions", ar: "الأدوار والصلاحيات" },
  define_access: { en: "Define access levels for your team", ar: "تحديد مستويات الوصول لفريقك" },
  add_role: { en: "Add New Role", ar: "إضافة دور جديد" },
  permissions: { en: "Permissions", ar: "الصلاحيات" },
  staff_members: { en: "Staff Members", ar: "أعضاء الفريق" },
  permission_matrix: { en: "Permission Matrix Preview", ar: "معاينة مصفوفة الصلاحيات" },
  select_role_edit: { en: "Select a role on the left to edit its granular permissions.", ar: "اختر دورًا من اليسار لتعديل صلاحياته الدقيقة." },

  // Security
  audit_logs: { en: "Security & Audit Logs", ar: "سجلات الأمان والتدقيق" },
  track_actions: { en: "Track every action within the system for compliance and security", ar: "تتبع كل إجراء داخل النظام للامتثال والأمان" },
  failed_login: { en: "Failed Login Attempts", ar: "محاولات دخول فاشلة" },
  highest_privilege: { en: "Highest Privilege Level", ar: "أعلى مستوى صلاحية" },
  top_locations: { en: "Top Login Locations", ar: "أعلى مواقع الدخول" },
  search_logs_placeholder: { en: "Search by actor, IP or action...", ar: "البحث حسب الفاعل أو IP أو الإجراء..." },
  filter: { en: "Filter", ar: "تصفية" },
  export_logs: { en: "Export Logs", ar: "تصدير السجلات" },
  timestamp: { en: "Timestamp", ar: "الطابع الزمني" },
  actor: { en: "Actor", ar: "الفاعل" },
  target: { en: "Target", ar: "الهدف" },
  ip_address: { en: "IP Address", ar: "عنوان IP" },
  details: { en: "Details", ar: "التفاصيل" },

  // Common
  search: { en: "Search", ar: "بحث" },
  loading: { en: "Loading...", ar: "جاري التحميل..." },
  success: { en: "Success", ar: "تم بنجاح" },
  error: { en: "Error", ar: "خطأ" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  save: { en: "Save", ar: "حفظ" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};