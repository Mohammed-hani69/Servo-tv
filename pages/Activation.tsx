import React, { useState } from 'react';
import { QrCode, Tv, ArrowRight, ShieldCheck } from 'lucide-react';
import { login, getDeviceId } from '../services/authService';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface ActivationProps {
  onLogin: (user: any) => void;
}

const Activation: React.FC<ActivationProps> = ({ onLogin }) => {
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const deviceId = getDeviceId();
  const { t } = useLanguage();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Activation Logic
    try {
      if (activationCode === '123456' || activationCode.length > 3) {
        // Mock Login for now
        const response = await login('demo@tvapp.com', 'password');
        if (response.user) {
           onLogin(response.user);
        }
      } else {
        throw new Error('Invalid Activation Code');
      }
    } catch (err) {
      setError('Activation Failed. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 w-full max-w-5xl h-[600px] bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden">
        
        {/* Left: QR & Instructions */}
        <div className="w-1/3 bg-white/5 p-8 flex flex-col items-center justify-center text-center border-r border-white/5 relative">
          <div className="absolute top-6 left-6 opacity-50">
             <Logo className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6 mt-4">{t('scan_activate')}</h2>
          <div className="p-4 bg-white rounded-xl shadow-lg mb-6">
            <QrCode size={180} className="text-slate-900" />
          </div>
          <p className="text-slate-300 text-sm mb-2">Or visit <span className="text-blue-400 font-mono">servo.tv/activate</span></p>
          <p className="text-slate-400 text-xs">Enter code shown on your mobile</p>
        </div>

        {/* Right: Code Input */}
        <div className="w-2/3 p-12 flex flex-col justify-center">
           <div className="mb-8">
             <h1 className="text-4xl font-bold text-white mb-2">{t('device_activation')}</h1>
             <p className="text-slate-400">{t('enter_code_msg')}</p>
           </div>

           <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center gap-4">
              <Tv className="text-blue-400" size={32} />
              <div>
                <div className="text-xs text-blue-300 uppercase tracking-wider">{t('device_id')}</div>
                <div className="text-xl font-mono text-white tracking-widest">{deviceId.slice(0, 12).toUpperCase()}</div>
              </div>
           </div>

           <form onSubmit={handleActivate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">{t('activation_code')}</label>
                <input 
                  type="text" 
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                  className="tv-interactive tv-focus w-full bg-slate-800/80 border-2 border-slate-700 rounded-xl p-5 text-3xl text-center font-mono tracking-[1em] text-white focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all placeholder-slate-600 uppercase"
                  placeholder="------"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm flex items-center gap-2">
                  <ShieldCheck size={16} /> {error}
                </div>
              )}

              <Button type="submit" block className="py-5 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg">
                {loading ? t('activating') : t('activate_btn')} <ArrowRight className="ml-2" />
              </Button>
           </form>
           
           <div className="mt-auto text-center">
             <p className="text-xs text-slate-500">By activating, you agree to our Terms of Service.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Activation;