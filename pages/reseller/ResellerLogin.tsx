import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { login } from '../../services/authService';
import Logo from '../../components/Logo';

const ResellerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mock Reseller Login
      const res = await login(email, password);
      // In a real app, we would check res.user.role === 'reseller'
      if (res.user) {
        navigate('/reseller/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials or account suspended.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-white/5 mb-4">
             <Logo className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Distributor Portal</h1>
          <p className="text-slate-400 text-sm">Manage your IPTV business securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="distributor@servo.tv"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
             <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                   {rememberMe && <CheckCircle size={10} className="text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="text-slate-400 group-hover:text-slate-300">Remember me</span>
             </label>
             <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</button>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
             {loading ? 'Authenticating...' : 'Access Dashboard'} {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-start gap-3">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
                <p className="text-slate-400 mb-1 font-semibold">Demo Credentials:</p>
                <div className="flex flex-col gap-1 font-mono text-blue-300">
                    <span>Email: demo@tvapp.com</span>
                    <span>Pass: password</span>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
           &copy; 2024 Servo Systems. Secure Access v2.1.0
        </div>
      </div>
    </div>
  );
};

export default ResellerLogin;