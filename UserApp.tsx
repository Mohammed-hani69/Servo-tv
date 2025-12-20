import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Activation from './pages/Activation';
import Splash from './pages/Splash';
import UserHome from './pages/UserHome';
import Player from './pages/Player';
import LiveTV from './pages/LiveTV';
import Movies from './pages/Movies';
import Playlists from './pages/Playlists';
import Account from './pages/Account';
import Settings from './pages/Settings';
import { useTVNavigation } from './hooks/useTVNavigation';
import { isAuthenticated, logout, getCurrentUser } from './services/authService';
import { User } from './types';

const UserApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  
  // Initialize Global TV Navigation
  useTVNavigation();

  useEffect(() => {
    // Check auth on mount
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getCurrentUser());
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.href = '/'; // Force redirect to landing
  };

  if (!splashFinished) {
    return <Splash onFinish={() => setSplashFinished(true)} />;
  }

  if (!user) {
    return <Activation onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-900/70 backdrop-blur-sm text-slate-50 overflow-hidden">
        <div className="flex w-full">
           <Routes>
              {/* Hide Sidebar on Player */}
              <Route path="/player" element={null} />
              <Route path="*" element={<Sidebar onLogout={handleLogout} />} />
           </Routes>

           <main className="flex-1 relative bg-transparent overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="home" replace />} />
                
                <Route path="home" element={<UserHome />} />
                <Route path="live" element={<LiveTV />} />
                <Route path="movies" element={<Movies />} />
                <Route path="series" element={<Movies type="series" />} />
                <Route path="playlists" element={<Playlists />} />
                <Route path="account" element={<Account user={user} />} />
                
                <Route path="player" element={<Player />} />
                <Route path="settings" element={<Settings />} />
                
                <Route path="*" element={<Navigate to="home" />} />
              </Routes>
           </main>
        </div>
    </div>
  );
};

export default UserApp;