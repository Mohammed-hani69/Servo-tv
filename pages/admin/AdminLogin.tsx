import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowRight, Info } from 'lucide-react';
import { login } from '../../services/authService';
import Logo from '../../components/Logo';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mock Admin Login (admin@servo.tv / admin)
      const res = await login(email, password);
      if (res.user && res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized access.');
      }
    } catch (err) {
      setError('Invalid administration credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 z-0" />
      
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-4">
                <Logo className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">System Administration</h1>
            <p className="text-slate-500 text-sm">Restricted access area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Admin Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    placeholder="admin@servo.tv"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    placeholder="••••••"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                    <ShieldAlert size={16} /> {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
                {loading ? 'Verifying...' : 'Authenticate'} <ArrowRight size={16} />
            </button>
        </form>

        <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
            <Info size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs">
                <p className="text-slate-400 mb-1 font-semibold">Demo Credentials:</p>
                <div className="flex flex-col gap-1 font-mono text-slate-300">
                    <span>Email: <span className="text-white">admin@servo.tv</span></span>
                    <span>Pass: <span className="text-white">admin</span></span>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-600">IP Logged: 192.168.1.1</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;