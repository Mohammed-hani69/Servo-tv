import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Maximize, Volume2, List, FastForward, Rewind } from 'lucide-react';
import { MOCK_CHANNELS, KEY_CODES } from '../constants';

const Player: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const streamUrl = searchParams.get('url');

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChannelList, setShowChannelList] = useState(false);
  const [activeChannel, setActiveChannel] = useState(MOCK_CHANNELS[0]);
  
  // Ref to the Play button to focus it when controls open
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // If a URL is passed, use it, otherwise fallback to mock
  const currentSrc = streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Auto-hide controls
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (showControls) {
      timeout = setTimeout(() => {
         if (!showChannelList) setShowControls(false);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, showChannelList]);

  // Handle key interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Wake up controls on any key
      if (!showControls) {
        setShowControls(true);
        // Focus play button immediately if controls were hidden
        setTimeout(() => playButtonRef.current?.focus(), 100);
        return;
      }

      switch (e.keyCode) {
        case KEY_CODES.BACK:
        case KEY_CODES.ESCAPE:
           if (showChannelList) {
             setShowChannelList(false);
             playButtonRef.current?.focus();
           } else {
             navigate(-1);
           }
           e.stopPropagation();
           break;
        case KEY_CODES.UP:
            if (!showChannelList && document.activeElement?.tagName !== 'BUTTON') {
                setShowChannelList(true);
            }
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Initial Focus
    setTimeout(() => playButtonRef.current?.focus(), 500);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showChannelList, showControls]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden group">
      {/* Video Element (Mocking HLS) */}
      <video
        className="w-full h-full object-contain"
        autoPlay={isPlaying}
        loop 
        muted={false}
        poster="https://picsum.photos/1920/1080"
        src={currentSrc} 
      />

      {/* Channel Overlay (Sidebar) */}
      <div className={`absolute top-0 right-0 h-full w-96 bg-slate-900/95 transform transition-transform duration-300 z-50 p-4 border-l border-slate-700 shadow-2xl ${showChannelList ? 'translate-x-0' : 'translate-x-full'}`}>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
            <List /> Quick Switch
        </h3>
        <div className="space-y-2 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            {MOCK_CHANNELS.map(ch => (
                <button
                    key={ch.id}
                    onClick={() => { setActiveChannel(ch); setShowChannelList(false); }}
                    className={`tv-interactive tv-focus w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all ${activeChannel.id === ch.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                    <img src={ch.logo} className="w-12 h-12 rounded-md bg-slate-600 object-cover" />
                    <div>
                        <div className="font-bold text-base">{ch.name}</div>
                        <div className="text-xs opacity-70">{ch.category}</div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 z-40 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="mb-6">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
            <h1 className="text-4xl font-bold text-white mt-2 drop-shadow-md">{streamUrl ? 'Selected Channel' : activeChannel.name}</h1>
            <p className="text-slate-300 text-sm mt-1">{activeChannel.category} • 1080p</p>
        </div>

        <div className="flex items-center gap-6">
            <button className="tv-interactive tv-focus p-4 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm">
                <Rewind fill="white" size={24} />
            </button>

            <button 
                ref={playButtonRef}
                onClick={() => setIsPlaying(!isPlaying)}
                className="tv-interactive tv-focus p-6 bg-blue-600 rounded-full hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:scale-110 transition-all"
            >
                {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} />}
            </button>

             <button className="tv-interactive tv-focus p-4 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm">
                <FastForward fill="white" size={24} />
            </button>
            
            {/* Progress Bar (Mock) */}
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden mx-4">
                <div className="h-full bg-blue-500 w-full animate-pulse relative">
                     <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white]"></div>
                </div>
            </div>
            
            <button className="tv-interactive tv-focus p-4 bg-white/10 rounded-full hover:bg-white/20 text-white">
                <Volume2 />
            </button>
            <button className="tv-interactive tv-focus p-4 bg-white/10 rounded-full hover:bg-white/20 text-white">
                <Maximize />
            </button>
        </div>
        
        <div className="mt-8 text-xs text-slate-400 flex justify-center gap-8 font-mono">
            <span className="flex items-center gap-1"><span className="border border-slate-600 px-1.5 py-0.5 rounded bg-slate-800">UP</span> Channel List</span>
            <span className="flex items-center gap-1"><span className="border border-slate-600 px-1.5 py-0.5 rounded bg-slate-800">OK</span> Pause/Play</span>
            <span className="flex items-center gap-1"><span className="border border-slate-600 px-1.5 py-0.5 rounded bg-slate-800">BACK</span> Exit</span>
        </div>
      </div>
    </div>
  );
};

export default Player;