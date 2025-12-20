import React, { useState } from 'react';
import { Save, Lock, User, Key, Shield, Globe } from 'lucide-react';
import Button from '../../components/Button';
import { getCurrentUser } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';

const ResellerSettings: React.FC = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState('profile');
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('settings_title')}</h1>
        <p className="text-slate-400 text-sm">{t('settings_subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-start px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
            >
                <User size={18} /> {t('profile_tab')}
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`w-full text-start px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
            >
                <Lock size={18} /> {t('password_tab')}
            </button>
            <button 
                onClick={() => setActiveTab('api')}
                className={`w-full text-start px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'api' ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
            >
                <Key size={18} /> {t('api_tab')}
            </button>
            <button 
                onClick={() => setActiveTab('2fa')}
                className={`w-full text-start px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === '2fa' ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
            >
                <Shield size={18} /> {t('security_tab')}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">{t('account_info')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('display_name')}</label>
                            <input type="text" defaultValue={user?.name || "Distributor"} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('email_addr')}</label>
                            <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('phone_number')}</label>
                            <input type="tel" defaultValue="+1 555 000 0000" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('company_brand')}</label>
                            <input type="text" defaultValue="Servo IPTV" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Globe size={18} className="text-blue-400" /> {t('language_label')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`p-3 rounded-lg border text-center transition-all font-medium ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => setLanguage('ar')}
                                className={`p-3 rounded-lg border text-center transition-all font-medium ${language === 'ar' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="gap-2"> <Save size={18} /> {t('save_changes')}</Button>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">{t('change_password')}</h2>
                    <div className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('current_password')}</label>
                            <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('new_password')}</label>
                            <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">{t('confirm_password')}</label>
                            <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="pt-4">
                         <Button className="gap-2">{t('update_password')}</Button>
                    </div>
                </div>
            )}
            
            {activeTab === 'api' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4">{t('api_config')}</h2>
                    <p className="text-slate-400 text-sm mb-6">{t('api_desc')}</p>
                    
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('public_key')}</label>
                        <div className="flex gap-2">
                             <input type="text" readOnly value="pk_live_51Mxz..." className="flex-1 bg-transparent text-white font-mono text-sm outline-none" />
                             <button className="text-blue-400 hover:text-white text-xs">Copy</button>
                        </div>
                    </div>
                    
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('secret_key')}</label>
                        <div className="flex gap-2">
                             <input type="password" readOnly value="sk_live_99999..." className="flex-1 bg-transparent text-white font-mono text-sm outline-none" />
                             <button className="text-blue-400 hover:text-white text-xs">Reveal</button>
                        </div>
                    </div>

                    <div className="pt-4">
                         <Button variant="secondary">{t('regenerate_keys')}</Button>
                    </div>
                </div>
            )}

            {activeTab === '2fa' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4">{t('two_factor')}</h2>
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-4">
                        <Shield className="text-blue-400 shrink-0" size={24} />
                        <div>
                            <h3 className="text-white font-bold">Secure your account</h3>
                            <p className="text-slate-400 text-sm mt-1">Two-factor authentication adds an extra layer of security to your account. You will need to provide a code from your authenticator app to log in.</p>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button>{t('enable_2fa')}</Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResellerSettings;