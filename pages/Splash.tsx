import React, { useEffect } from 'react';
import Logo from '../components/Logo';

interface SplashProps {
  onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // 2.5 seconds splash
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xl relative z-50">
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl shadow-[0_0_80px_rgba(37,99,235,0.3)] border border-white/10 animate-[pulse-glow_3s_infinite]">
        <Logo className="w-24 h-24 drop-shadow-2xl" />
      </div>
      <h1 className="text-5xl font-bold text-white tracking-[0.2em] animate-pulse">SERVO</h1>
      <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 80px rgba(37,99,235,0.3);
            border-color: rgba(255,255,255,0.1);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 120px rgba(37,99,235,0.6);
            border-color: rgba(255,255,255,0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default Splash;