' ==============================================================================
' DeviceId.brs - Roku Device Identification & Registration System
' 
' المسؤوليات:
' 1. توليد Device ID فريد للـ Roku
' 2. حفظه في Registry (بقاء ثابت حتى بعد إعادة التشغيل)
' 3. استرجاع Device ID عند الحاجة
' 4. إرسال Device ID للـ backend عند تشغيل التطبيق
' 5. استقبال كود التفعيل والبيانات من السيرفر
' ==============================================================================

' ثوابت النظام
DEVICE_ID_KEY = "servo_device_id"              ' مفتاح التخزين في Registry
DEVICE_REGISTERED_TIME_KEY = "servo_reg_time"  ' وقت التسجيل
REGISTRY_SECTION = "ServoTV"                    ' قسم التسجيل

' ==============================================================================
' دالة: الحصول على UUID فريد من Roku
' ==============================================================================
function GetRokuUUID() as string
    sec = CreateObject("roRegistrySection", "misc")
    rokuSerial = ""
    
    try
        rokuSerial = sec.Read("rokuSerialNumber")
    catch e
        print "❌ خطأ في الحصول على Roku Serial: " e.GetMessage()
    end try
    
    if rokuSerial = invalid or rokuSerial = ""
        ' محاولة بديلة: الحصول على معلومات النظام
        sysInfo = CreateObject("roSystemInformation")
        if sysInfo <> invalid
            rokuSerial = sysInfo.GetDisplayName()
        end if
    end if
    
    return rokuSerial
end function

' ==============================================================================
' دالة: توليد Device ID فريد (UUID مبسط)
' ==============================================================================
function GenerateUniqueDeviceId() as string
    randomizer = CreateObject("roRandom")
    randomizer.SetSeed(GetTickCount())
    
    ' الحصول على Roku UUID/Serial
    rokuId = GetRokuUUID()
    
    ' توليد رقم عشوائي
    randomPart = ""
    for i = 1 to 8
        randomPart = randomPart + Format("%02x", randomizer.GetRandomNumber())
    end for
    
    ' دمج معرف Roku مع الجزء العشوائي
    ' الصيغة: ROKU-XXXXXXXXXX (12 حرف)
    deviceId = "ROKU-" + rokuId.Left(7) + "-" + randomPart
    
    return deviceId
end function

' ==============================================================================
' دالة: الحصول على أو توليد Device ID من Registry
' ==============================================================================
function GetOrCreateDeviceId() as string
    sec = CreateObject("roRegistrySection", REGISTRY_SECTION)
    
    ' محاولة استرجاع Device ID الموجود
    existingId = sec.Read(DEVICE_ID_KEY)
    
    if existingId <> invalid and existingId <> ""
        print "✅ Device ID موجود في Registry: " existingId
        return existingId
    end if
    
    ' توليد Device ID جديد
    print "🔄 توليد Device ID جديد..."
    newDeviceId = GenerateUniqueDeviceId()
    
    ' حفظ في Registry
    sec.Write(DEVICE_ID_KEY, newDeviceId)
    sec.Write(DEVICE_REGISTERED_TIME_KEY, tostr(GetTickCount()))
    sec.Flush()
    
    print "✅ تم توليد وحفظ Device ID: " newDeviceId
    return newDeviceId
end function

' ==============================================================================
' دالة: إرسال Device ID للـ backend وتسجيل الجهاز
' ==============================================================================
function RegisterDeviceWithBackend(backendUrl as string, deviceId as string) as object
    result = {
        success: false,
        device_id: "",
        activation_code: "",
        expires_in_seconds: 0,
        error: ""
    }
    
    try
        ' إنشاء Request HTTP
        http = CreateObject("roUrlTransfer")
        http.SetUrl(backendUrl + "/api/device/register")
        http.SetCertificatesFile("common:/certs/ca-bundle.crt")
        http.InitClientCertificates()
        
        ' تحديد Headers
        headers = {
            "Content-Type": "application/json"
        }
        http.SetHeaders(headers)
        
        ' إعداد بيانات التسجيل
        requestData = FormatJson({
            device_type: "roku",
            actual_device_id: deviceId,
            device_id_source: "roku"
        })
        
        print "📤 إرسال طلب التسجيل: " requestData
        
        ' إرسال الطلب
        http.SetRequest("POST")
        responseCode = http.PostFromString(requestData)
        
        print "📥 رد السيرفر (Status Code): " responseCode
        
        if responseCode = 200 or responseCode = 201
            responseString = http.GetString()
            print "📨 رد السيرفر: " responseString
            
            ' محاولة تحليل JSON
            parser = CreateObject("roJsonParser")
            if parser <> invalid
                responseJson = parser.Parse(responseString)
                
                if responseJson <> invalid and type(responseJson) = "roAssociativeArray"
                    result.success = true
                    result.device_id = responseJson.lookup("device_id")
                    result.activation_code = responseJson.lookup("activation_code")
                    result.expires_in_seconds = responseJson.lookup("expires_in_seconds")
                    result.error = ""
                    
                    print "✅ تم استقبال بيانات التفعيل بنجاح"
                else
                    result.error = "فشل تحليل رد السيرفر"
                    print "❌ فشل تحليل JSON: " responseString
                end if
            end if
        else
            result.error = "HTTP Error: " + tostr(responseCode)
            print "❌ خطأ HTTP: " responseCode
        end if
        
    catch e
        result.error = e.GetMessage()
        print "❌ خطأ في الاتصال بالسيرفر: " e.GetMessage()
    end try
    
    return result
end function

' ==============================================================================
' دالة: حفظ بيانات التفعيل في Registry
' ==============================================================================
sub SaveActivationData(deviceId as string, activationCode as string, expiresIn as integer)
    sec = CreateObject("roRegistrySection", REGISTRY_SECTION)
    
    sec.Write("device_id", deviceId)
    sec.Write("activation_code", activationCode)
    sec.Write("activation_expires", tostr(GetTickCount() + (expiresIn * 1000)))
    sec.Flush()
    
    print "💾 تم حفظ بيانات التفعيل في Registry"
end sub

' ==============================================================================
' دالة: الحصول على بيانات التفعيل من Registry
' ==============================================================================
function GetActivationData() as object
    sec = CreateObject("roRegistrySection", REGISTRY_SECTION)
    
    data = {
        device_id: sec.Read("device_id"),
        activation_code: sec.Read("activation_code"),
        activation_expires: sec.Read("activation_expires")
    }
    
    return data
end function

' ==============================================================================
' دالة: تنسيق JSON بسيط
' ==============================================================================
function FormatJson(data as object) as string
    json = "{"
    
    for each key in data
        value = data[key]
        if type(value) = "roString"
            json = json + """" + key + """:""" + value + ""","
        else if type(value) = "roInt" or type(value) = "roDouble"
            json = json + """" + key + """:" + tostr(value) + ","
        else if type(value) = "roBoolean"
            json = json + """" + key + """:" + (value ? "true" : "false") + ","
        end if
    end for
    
    ' إزالة الفاصلة الأخيرة
    if json.Right(1) = ","
        json = json.Left(json.Len() - 1)
    end if
    
    json = json + "}"
    return json
end function

' ==============================================================================
' دالة: إنشاء رسالة bridge لإرسالها إلى Frontend (JavaScript)
' ==============================================================================
function CreateDeviceDataMessage(deviceData as object) as string
    ' إنشاء رسالة JSON يمكن للـ JavaScript استقبالها
    message = {
        type: "device_data",
        device_id: deviceData.device_id,
        activation_code: deviceData.activation_code,
        expires_in_seconds: deviceData.expires_in_seconds,
        device_source: "roku",
        success: true
    }
    
    return FormatJson(message)
end function

' ==============================================================================
' دالة رئيسية: تسجيل الجهاز عند بدء التطبيق
' ==============================================================================
function InitializeDevice(backendUrl as string) as object
    print "🚀 بدء تهيئة معرف الجهاز..."
    
    ' الحصول على أو توليد Device ID
    rokuDeviceId = GetOrCreateDeviceId()
    
    ' تسجيل الجهاز مع السيرفر
    registrationResult = RegisterDeviceWithBackend(backendUrl, rokuDeviceId)
    
    if registrationResult.success
        ' حفظ البيانات في Registry
        SaveActivationData(
            registrationResult.device_id,
            registrationResult.activation_code,
            registrationResult.expires_in_seconds
        )
        
        print "✅ تم تسجيل الجهاز بنجاح"
        print "  Device ID: " registrationResult.device_id
        print "  Activation Code: " registrationResult.activation_code
        print "  Expires In: " registrationResult.expires_in_seconds " seconds"
    else
        print "❌ فشل تسجيل الجهاز: " registrationResult.error
    end if
    
    return registrationResult
end function

' ==============================================================================
' دالة مساعدة: اختبار الاتصال
' ==============================================================================
function TestConnection(backendUrl as string) as boolean
    try
        http = CreateObject("roUrlTransfer")
        http.SetUrl(backendUrl + "/health")
        http.SetCertificatesFile("common:/certs/ca-bundle.crt")
        
        http.SetRequest("GET")
        responseCode = http.GetResponseCode()
        
        if responseCode = 200
            print "✅ الاتصال بالسيرفر متاح"
            return true
        else
            print "⚠️  الاتصال موجود لكن رد غير متوقع: " responseCode
            return false
        end if
    catch e
        print "❌ فشل الاتصال بالسيرفر: " e.GetMessage()
        return false
    end try
end function
