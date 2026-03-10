import React from 'react';

const Header = ({ currentView, onViewChange }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-primary/10 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 w-full relative">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-1.5 rounded-lg">
          <span className="material-symbols-outlined text-background-dark text-2xl font-bold">query_stats</span>
        </div>
        <h1 className="text-lg font-bold leading-tight hidden md:block">Twin Capital</h1>
      </div>

      <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
        <button
          onClick={() => onViewChange('feed')}
          className={`text-sm flex items-center gap-2 transition-colors ${currentView === 'feed' ? 'font-semibold text-primary' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">dynamic_feed</span> Feed
        </button>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`text-sm flex items-center gap-2 transition-colors ${currentView === 'dashboard' ? 'font-semibold text-primary' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">dashboard</span> Dashboard
        </button>
        <button
          onClick={() => onViewChange('trading')}
          className={`text-sm flex items-center gap-2 transition-colors ${currentView === 'trading' ? 'font-semibold text-primary' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">hub</span> Trading
        </button>
        <button
          onClick={() => onViewChange('media')}
          className={`text-sm flex items-center gap-2 transition-colors ${currentView === 'media' ? 'font-semibold text-primary' : 'font-medium text-slate-600 dark:text-slate-400 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">play_circle</span> Media
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <button
          onClick={() => onViewChange('profile')}
          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors ${currentView === 'profile' ? 'border-primary' : 'border-primary cursor-pointer hover:border-primary/80'}`}
        >
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
