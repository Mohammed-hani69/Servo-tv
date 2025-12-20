import React, { useState } from 'react';
import { Lock, Smartphone, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { login, getDeviceId, verifyDeviceBinding } from '../services/authService';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [email, setEmail] = useState('demo@tvapp.com');
  const [password, setPassword] = useState('password');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const deviceId = getDeviceId();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.requiresVerification) {
        setStep('verification');
      } else if (response.user) {
        onLogin(response.user);
      }
    } catch (err) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyDeviceBinding(verificationCode);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-2 bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* Info Side */}
        <div className="p-10 bg-gradient-to-br from-blue-600/90 to-blue-800/90 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                   <Logo className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Servo</h1>
                <p className="text-blue-100 text-lg">Experience the next generation of streaming. High quality, zero buffer.</p>
            </div>
            
            <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-white/10 rounded-lg">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Secure Access</h3>
                        <p className="text-sm text-blue-200">Device binding protects your account ID: <br/><span className="font-mono bg-black/20 px-1 rounded">{deviceId.slice(0, 15)}...</span></p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-white/10 rounded-lg">
                      <Smartphone size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Smart Remote</h3>
                        <p className="text-sm text-blue-200">Optimized for TV remotes and spatial navigation.</p>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Form Side */}
        <div className="p-10 flex flex-col justify-center">
            
            {step === 'login' ? (
              <>
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-white">{t('welcome_login')}</h2>
                    <p className="text-slate-400">{t('signin_continue')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('email_addr')}</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="tv-interactive tv-focus w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white focus:border-blue-500 transition-colors placeholder-slate-500"
                            placeholder="user@example.com"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">{t('password')}</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="tv-interactive tv-focus w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white focus:border-blue-500 transition-colors placeholder-slate-500"
                            placeholder="••••••••"
                            dir="ltr"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-800 rounded flex items-center gap-2 text-red-400 text-sm">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" block disabled={loading} className="py-4 text-lg shadow-lg shadow-blue-900/20">
                        {loading ? t('authenticating') : t('signin_btn')} <Lock size={18} />
                    </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-400">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">New Device Detected</h2>
                    <p className="text-slate-400 text-sm mt-2">
                        We don't recognize this TV. A verification code has been sent to 
                        <span className="text-white font-medium"> {email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerification} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Verification Code (Demo: 123456)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="tv-interactive tv-focus w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white focus:border-blue-500 transition-colors text-center text-2xl tracking-widest font-mono"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                            <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-800 rounded flex items-center gap-2 text-red-400 text-sm">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <Button type="submit" block disabled={loading} className="py-4 text-lg">
                        {loading ? 'Verifying...' : 'Bind Device'} <ShieldCheck size={18} />
                    </Button>
                    
                    <button 
                        type="button" 
                        onClick={() => setStep('login')}
                        className="tv-interactive tv-focus w-full text-sm text-slate-500 hover:text-white py-2"
                    >
                        Back to Login
                    </button>
                </form>
              </>
            )}
            
            <p className="mt-6 text-center text-xs text-slate-500">
                Protected by End-to-End Encryption. <br/>
                Device ID Hash: {deviceId.split('-')[1]}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;