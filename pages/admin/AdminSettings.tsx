import React, { useState, useEffect } from 'react';
import { Smartphone, Clock, Database, Shield, Zap, Save, Globe, Mail, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import { AdminSettings, User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCurrentUser } from '../../services/authService';

const AdminSettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const currentUser = getCurrentUser();
  const [settings, setSettings] = useState<AdminSettings>({
    pointPriceCents: 10000,
    pointsPerUser: 1,
    subscriptionCosts: {
        month1: 1,
        month3: 3,
        month6: 5,
        month12: 10,
        costPerExtraDevice: 1
    },
    allowMultiDevice: false,
    defaultDeviceLimit: 1,
    maintenanceMode: false,
    minAppVersion: '1.0.0',
    tokenExpirationHours: 24,
  });

  // State for admin-specific report preferences
  const [reportEmail, setReportEmail] = useState('');
  const [dailyReport, setDailyReport] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState(false);

  useEffect(() => {
    // Initialize with current user's report preferences if available
    if (currentUser?.reportPreferences) {
        setReportEmail(currentUser.reportPreferences.dailyReportEmail);
        setDailyReport(currentUser.reportPreferences.receiveDaily);
        setWeeklyReport(currentUser.reportPreferences.receiveWeekly);
        setMonthlyReport(currentUser.reportPreferences.receiveMonthly);
    } else if (currentUser?.email) {
        // Default to current email if no preferences set yet
        setReportEmail(currentUser.email);
        // Default options if new
        setDailyReport(true); 
        setWeeklyReport(true);
        setMonthlyReport(true);
    }
  }, []);

  const handleChange = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveReportPreferences = () => {
      // In a real application, you would make an API call here to update the user's preferences
      // Example: updateAdminReportPreferences(currentUser.id, { dailyReportEmail: reportEmail, receiveDaily: dailyReport, ... })
      
      // For demonstration, we'll alert the user and simulate a save
      const updatedUser = { 
          ...currentUser, 
          reportPreferences: {
              dailyReportEmail: reportEmail,
              receiveDaily: dailyReport,
              receiveWeekly: weeklyReport,
              receiveMonthly: monthlyReport
          }
      };
      
      // Update local storage to simulate persistence for this session
      localStorage.setItem('tv_user', JSON.stringify(updatedUser));
      
      alert(`${t('success')}: Report preferences updated for ${reportEmail}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-white">{t('admin_settings')}</h1>
            <p className="text-slate-400 text-sm">{t('global_settings')}</p>
         </div>
         <Button className="bg-red-600 hover:bg-red-700 gap-2">
             <Save size={18} /> {t('save_changes')}
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Admin Specific Report Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Mail size={120} />
              </div>
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Mail className="text-orange-400" size={20} /> {t('report_settings')}
              </h3>
              <p className="text-slate-400 text-sm mb-4 relative z-10">{t('only_one_email_allowed')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">{t('report_email')}</label>
                      <input 
                        type="email" 
                        value={reportEmail}
                        onChange={(e) => setReportEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 transition-colors" 
                        placeholder={currentUser?.email}
                      />
                      <p className="text-xs text-slate-500 mt-2">{t('report_email_desc')}</p>
                  </div>

                  <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-400 mb-2">{t('report_frequency')}</label>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-400" />
                              <span className="text-white text-sm">{t('daily_report')}</span>
                          </div>
                          <div 
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${dailyReport ? 'bg-green-600' : 'bg-slate-600'}`}
                            onClick={() => setDailyReport(!dailyReport)}
                          >
                             <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${dailyReport ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-purple-400" />
                              <span className="text-white text-sm">{t('weekly_report')}</span>
                          </div>
                          <div 
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${weeklyReport ? 'bg-green-600' : 'bg-slate-600'}`}
                            onClick={() => setWeeklyReport(!weeklyReport)}
                          >
                             <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${weeklyReport ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-emerald-400" />
                              <span className="text-white text-sm">{t('monthly_report')}</span>
                          </div>
                          <div 
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${monthlyReport ? 'bg-green-600' : 'bg-slate-600'}`}
                            onClick={() => setMonthlyReport(!monthlyReport)}
                          >
                             <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${monthlyReport ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                      </div>
                  </div>
              </div>
              <div className="mt-6 flex justify-end relative z-10">
                  <Button onClick={handleSaveReportPreferences} className="bg-slate-800 hover:bg-slate-700 text-sm py-2 px-6 border border-slate-700">
                      {t('save')}
                  </Button>
              </div>
          </div>

          {/* General Policies */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Smartphone className="text-blue-400" size={20} /> {t('sub_devices_policy')}
              </h3>
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">{t('default_device_limit')}</label>
                      <input 
                        type="number" 
                        value={settings.defaultDeviceLimit}
                        onChange={(e) => handleChange('defaultDeviceLimit', parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" 
                      />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                      <div>
                          <div className="text-white text-sm font-medium">{t('allow_multi_login')}</div>
                          <div className="text-slate-500 text-xs">If disabled, new login logs out old device</div>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer ${settings.allowMultiDevice ? 'bg-green-600' : 'bg-slate-600'}`}
                        onClick={() => handleChange('allowMultiDevice', !settings.allowMultiDevice)}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.allowMultiDevice ? 'left-7' : 'left-1'}`} />
                      </div>
                  </div>
              </div>
          </div>

          {/* Localization & Security */}
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Globe className="text-emerald-400" size={20} /> {t('system_language')}
                </h3>
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('select_language')}</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`p-3 rounded-lg border text-center transition-all font-bold ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('ar')}
                            className={`p-3 rounded-lg border text-center transition-all font-bold ${language === 'ar' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            العربية
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <Shield className="text-purple-400" size={20} /> {t('security_access')}
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('token_expiration')}</label>
                        <input 
                            type="number" 
                            value={settings.tokenExpirationHours}
                            onChange={(e) => handleChange('tokenExpirationHours', parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('min_app_version')}</label>
                        <input 
                            type="text" 
                            value={settings.minAppVersion}
                            onChange={(e) => handleChange('minAppVersion', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono" 
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} /> System Operations
              </h3>
              
              <div className="flex items-center justify-between p-6 bg-red-900/10 border border-red-900/30 rounded-lg">
                  <div className="flex gap-4">
                      <div className="p-3 bg-red-900/20 text-red-500 rounded-lg h-fit"><Database /></div>
                      <div>
                          <div className="text-white font-bold text-lg">{t('maintenance_mode')}</div>
                          <p className="