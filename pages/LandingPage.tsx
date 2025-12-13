import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, ChevronRight, Film, Globe, ShieldCheck, Lock } from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-red-500/30">
      
      {/* Cinematic Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
        {/* Animated Background Image / Poster Wall */}
        <div className="w-full h-full opacity-40 scale-105 animate-[pulse-slow_10s_infinite_alternate]" 
             style={{
               backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/d1532433-07b1-4e39-a920-0f08b81a489e/67033404-2df8-42e0-a5a0-4c8288b4da2c/IN-en-20231120-popsignuptwoweeks-perspective_alpha_website_large.jpg')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 h-screen flex flex-col justify-center items-center">
        
        {/* Header / Logo */}
        <div className="absolute top-8 left-0 right-0 flex justify-between items-center px-8">
            <div className="flex items-center gap-3">
                <Logo className="w-10 h-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <span className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">SERVO</span>
            </div>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Help Center</button>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-16 max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                Unlimited Entertainment.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">Limitless Possibilities.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Experience the next generation of streaming technology. Choose your portal to get started.
            </p>
        </div>

        {/* Split Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            
            {/* Viewer Option */}
            <button 
                onClick={() => navigate('/app')}
                className="group relative h-64 md:h-80 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] text-left"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Play fill="white" className="text-white ml-1" size={28} />
                    </div>
                    
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">Viewer</h2>
                        <p className="text-slate-400 text-sm mb-6 group-hover:text-slate-200">
                            Access thousands of Movies, Series, and Live TV channels on your device.
                        </p>
                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wider uppercase">
                            Enter App <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <Film className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700" />
            </button>

            {/* Reseller Option */}
            <button 
                onClick={() => navigate('/reseller/login')}
                className="group relative h-64 md:h-80 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.2)] text-left"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="text-white" size={28} />
                    </div>
                    
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Distributor</h2>
                        <p className="text-slate-400 text-sm mb-6 group-hover:text-slate-200">
                            Manage users, generate codes, and track your earnings via the dashboard.
                        </p>
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-wider uppercase">
                            Partner Login <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <Globe className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-[15deg] group-hover:rotate-0 transition-transform duration-700" />
            </button>
        </div>

        {/* Footer Features */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-500 text-sm font-medium relative z-30">
            <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> Secure Encryption
            </div>
            <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Global Access
            </div>
            <div className="flex items-center gap-2">
                <Play size={18} className="text-purple-500" /> 4K Ultra HD
            </div>
        </div>

        {/* Admin Link - Small Button */}
        <div className="absolute bottom-6 right-6 z-50">
            <button 
                onClick={() => navigate('/admin/login')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 hover:bg-red-900/50 border border-slate-800 hover:border-red-500/50 rounded-full text-[10px] font-bold text-slate-500 hover:text-red-400 transition-all uppercase tracking-wider backdrop-blur-sm"
            >
                <Lock size={10} /> Admin Panel
            </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;