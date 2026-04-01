import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Settings, LayoutDashboard, Rss, Laptop, PlayCircle, Wallet } from 'lucide-react';

const Header = ({ currentView, onViewChange }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-glass/80 backdrop-blur-xl z-[60] w-full transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/20">
             <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-main">Twin Capital</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-glass">
          <button
            onClick={() => onViewChange('feed')}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${currentView === 'feed' ? 'bg-primary text-[#000] font-bold shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Rss className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-primary text-[#000] font-bold shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => onViewChange('trading')}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${currentView === 'trading' ? 'bg-primary text-[#000] font-bold shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Laptop className="w-4 h-4" /> Trading
          </button>
          <button
            onClick={() => onViewChange('assets')}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${currentView === 'assets' ? 'bg-primary text-[#000] font-bold shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Wallet className="w-4 h-4" /> Assets
          </button>
          <button
            onClick={() => onViewChange('media')}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all ${currentView === 'media' ? 'bg-primary text-[#000] font-bold shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <PlayCircle className="w-4 h-4" /> Media
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-main bg-glass hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all border border-glass flex items-center justify-center shadow-sm"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
          
          <div className="relative group">
            <button className="p-2.5 text-main bg-glass hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all border border-glass flex items-center justify-center shadow-sm cursor-not-allowed opacity-70">
              <Bell className="w-5 h-5 opacity-70" />
            </button>
            <div className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary/40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(20,241,149,0.5)]"></span>
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-black text-[9px] text-white font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-glass/20 uppercase tracking-widest">
              Notifications Coming Soon
            </div>
          </div>
          
          <button 
            onClick={() => onViewChange('settings')}
            className="hidden md:flex p-2.5 text-main bg-glass hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all border border-glass items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 opacity-70" />
          </button>
          
          <button
            onClick={() => onViewChange('profile')}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shadow-md ${currentView === 'profile' ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-glass hover:border-primary/50'}`}
          >
            <img
              src={user?.image || user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder'}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-primary/20 z-[60] flex items-center justify-around py-2 px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] pb-4 pt-2">
        <button
          onClick={() => onViewChange('feed')}
          className={`flex flex-col items-center gap-1 w-16 py-1 ${currentView === 'feed' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'feed' ? 'font-bold' : ''}`}>dynamic_feed</span>
          <span className={`text-[10px] ${currentView === 'feed' ? 'font-bold' : ''}`}>Feed</span>
        </button>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center gap-1 w-16 py-1 ${currentView === 'dashboard' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'dashboard' ? 'font-bold' : ''}`}>dashboard</span>
          <span className={`text-[10px] ${currentView === 'dashboard' ? 'font-bold' : ''}`}>Dashboard</span>
        </button>
        <button
          onClick={() => onViewChange('trading')}
          className={`flex flex-col items-center gap-1 w-16 py-1 ${currentView === 'trading' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'trading' ? 'font-bold' : ''}`}>hub</span>
          <span className={`text-[10px] ${currentView === 'trading' ? 'font-bold' : ''}`}>Trading</span>
        </button>
        <button
          onClick={() => onViewChange('assets')}
          className={`flex flex-col items-center gap-1 w-16 py-1 ${currentView === 'assets' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'assets' ? 'font-bold' : ''}`}>account_balance_wallet</span>
          <span className={`text-[10px] ${currentView === 'assets' ? 'font-bold' : ''}`}>Assets</span>
        </button>
        <button
          onClick={() => onViewChange('media')}
          className={`flex flex-col items-center gap-1 w-16 py-1 ${currentView === 'media' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${currentView === 'media' ? 'font-bold' : ''}`}>play_circle</span>
          <span className={`text-[10px] ${currentView === 'media' ? 'font-bold' : ''}`}>Media</span>
        </button>
      </nav>
    </>
  );
};

export default Header;
