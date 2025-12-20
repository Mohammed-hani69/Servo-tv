' ==============================================================================
' MainScreen.brs - شاشة رئيسية للتطبيق مع تسجيل الجهاز
' 
' هذا الملف يوضح كيفية استخدام DeviceId.brs في التطبيق الرئيسي
' ==============================================================================

' استيراد ملف معرف الجهاز
#include "DeviceId.brs"

' ثوابت التطبيق
BACKEND_URL = "http://localhost:5000"  ' يمكن تعديله من الإعدادات
PORT = 8089                             ' منفذ الويب المحلي للـ Roku

' ==============================================================================
' دالة رئيسية: بدء التطبيق وتهيئة معرف الجهاز
' ==============================================================================
sub ShowMainScreen()
    print "🚀 بدء تطبيق ServoTV على Roku"
    
    ' إنشاء شاشة العرض الرئيسية
    screen = CreateObject("roScreen")
    screen.ShowMessage("ServoTV", "جاري تهيئة معرف الجهاز...", "", "")
    
    ' تهيئة معرف الجهاز وتسجيله مع السيرفر
    registrationResult = InitializeDevice(BACKEND_URL)
    
    if registrationResult.success
        ' عرض بيانات التفعيل على الشاشة
        screen.ShowMessage(
            "ServoTV - Device Activated",
            "Device ID: " + registrationResult.device_id + chr(10) +
            "Activation Code: " + registrationResult.activation_code,
            "Code Valid For: " + tostr(registrationResult.expires_in_seconds) + " seconds",
            ""
        )
        
        print "✅ تم تسجيل الجهاز بنجاح"
        print "  Device ID: " registrationResult.device_id
        print "  Activation Code: " registrationResult.activation_code
        
        ' الانتظار قبل المتابعة
        sleep(3000)
        
        ' يمكن إرسال بيانات التفعيل إلى الويب لعرضها في login.html
        SendActivationDataToWeb(registrationResult)
        
        ' بدء التطبيق الرئيسي (البث المباشر وما إلى ذلك)
        LaunchMainContent()
    else
        ' في حالة الفشل
        screen.ShowMessage(
            "ServoTV - Registration Failed",
            "Error: " + registrationResult.error,
            "Please try again or contact support",
            ""
        )
        
        print "❌ فشل تسجيل الجهاز: " registrationResult.error
        sleep(5000)
        
        ' محاولة إعادة التسجيل
        ShowMainScreen()
    end if
end sub

' ==============================================================================
' دالة: إرسال بيانات التفعيل إلى صفحة الويب (login.html)
' ==============================================================================
sub SendActivationDataToWeb(registrationResult as object)
    print "📤 إرسال بيانات التفعيل إلى صفحة الويب..."
    
    try
        ' إنشاء رسالة JSON لإرسالها إلى الويب
        messageData = {
            type: "device_data",
            device_id: registrationResult.device_id,
            activation_code: registrationResult.activation_code,
            expires_in_seconds: registrationResult.expires_in_seconds,
            device_source: "roku",
            success: true
        }
        
        ' تحويل البيانات إلى JSON
        messageJson = FormatJson(messageData)
        
        ' إنشاء JavaScript يتم تنفيذه على صفحة الويب
        jsCode = "window.postMessage(" + messageJson + ", '*');"
        
        print "✅ تم تحضير الرسالة: " jsCode
        
        ' هنا يمكن إرسال الرسالة إلى متصفح الويب المدمج في Roku
        ' عادة ما يتم ذلك من خلال roWebServer أو واجهة مدمجة أخرى
        
    catch e
        print "❌ خطأ في إرسال بيانات التفعيل: " e.GetMessage()
    end try
end sub

' ==============================================================================
' دالة: بدء المحتوى الرئيسي (البث المباشر)
' ==============================================================================
sub LaunchMainContent()
    print "🎬 بدء المحتوى الرئيسي..."
    
    ' يمكن هنا تحميل قائمة القنوات أو تشغيل البث المباشر
    ' سيعتمد على التطبيق الفعلي الخاص بك
    
    screen = CreateObject("roScreen")
    screen.ShowMessage("ServoTV", "Loading content...", "", "")
    
    ' محاكاة تحميل المحتوى
    sleep(2000)
    
    screen.ShowMessage("ServoTV", "Ready to play", "Enjoy your TV!", "")
end sub

' ==============================================================================
' دالة مساعدة: انتظار فترة زمنية
' ==============================================================================
sub sleep(milliseconds as integer)
    end_time = CreateObject("roDateTime").GetSecondsSinceEpoch() + (milliseconds / 1000)
    while CreateObject("roDateTime").GetSecondsSinceEpoch() < end_time
        ' انتظر
    end while
end sub

' ==============================================================================
' دالة: معالج الأحداث الرئيسي
' ==============================================================================
sub HandleRokuEvents()
    port = CreateObject("roMessagePort")
    screen = CreateObject("roScreen")
    screen.SetMessagePort(port)
    
    while true
        msg = wait(1000, port)  ' انتظر رسالة لمدة ثانية واحدة
        
        if type(msg) = "roScreenEvent"
            if msg.IsScreenClosed()
                print "❌ تم إغلاق الشاشة"
                exit while
            end if
        end if
    end while
end sub

' ==============================================================================
' نقطة الدخول الرئيسية
' ==============================================================================
Main()

sub Main()
    print "========================================"
    print "ServoTV - Roku Device Activation System"
    print "========================================"
    
    ' اختبار الاتصال بالسيرفر
    print ""
    print "🔍 اختبار الاتصال بالسيرفر..."
    if TestConnection(BACKEND_URL)
        print "✅ الاتصال متاح"
    else
        print "⚠️  تحذير: الاتصال قد يكون غير متاح"
    end if
    
    print ""
    
    ' بدء الشاشة الرئيسية
    ShowMainScreen()
    
    ' معالجة الأحداث
    HandleRokuEvents()
end sub
