import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, useTrans } from '../context/LanguageContext';
import {
  Bell, Settings, Rss, Laptop, PlayCircle, Wallet, Blocks,
  ChevronDown, Globe, Home, MessageSquare, BrainCircuit,
  AppWindow, Database
} from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const t = useTrans();
  const navigate = useNavigate();
  const location = useLocation();
  const [showServices, setShowServices] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const servicesRef = useRef(null);
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const isServiceActive = location.pathname.startsWith('/services');

  useEffect(() => {
    const handler = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) setShowServices(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMobileMore(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLink = (path, label, Icon) => (
    <button
      onClick={() => navigate(path)}
      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
        isActive(path)
          ? 'text-white bg-[var(--bg-subtle)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  const serviceItems = [
    { label: t('services.csAgent'), icon: MessageSquare, status: 'soon' },
    { label: t('services.consultant'), icon: BrainCircuit, status: 'soon' },
    { label: t('services.webappBuilder'), icon: AppWindow, status: 'soon' },
    { label: t('services.dataIntel'), icon: Database, status: 'soon' },
  ];

  return (
    <>
      <header className="flex items-center justify-between px-6 h-14 sticky top-0 bg-[var(--bg-main)]/95 backdrop-blur-sm border-b border-[var(--border)] z-[60] w-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-xs">TC</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Twin Capital</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLink('/', t('nav.home'), Home)}
          {navLink('/feed', t('nav.feed'), Rss)}
          {navLink('/trading', t('nav.trading'), Laptop)}
          {navLink('/assets', t('nav.assets'), Wallet)}
          {navLink('/media', t('nav.media'), PlayCircle)}

          {/* Services Dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              onClick={() => setShowServices(!showServices)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                isServiceActive
                  ? 'text-white bg-[var(--bg-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Blocks className="w-4 h-4" />
              {t('nav.services')}
              <ChevronDown className={`w-3 h-3 transition-transform ${showServices ? 'rotate-180' : ''}`} />
            </button>

            {showServices && (
              <div className="absolute top-full mt-1.5 right-0 w-56 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-lg shadow-black/20 p-1.5 z-50">
                <button
                  onClick={() => { navigate('/services'); setShowServices(false); }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                >
                  <Blocks className="w-4 h-4" />
                  {t('services.title')}
                </button>
                <div className="h-px bg-[var(--border)] my-1" />
                {serviceItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => { navigate('/services'); setShowServices(false); }}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </span>
                    <span className="text-[10px] font-medium text-[var(--text-tertiary)]">Soon</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLanguage}
            className="h-8 px-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang.toUpperCase()}
          </button>

          <button className="h-8 w-8 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="hidden md:flex h-8 w-8 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] rounded-lg transition-colors items-center justify-center"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-colors ${
              isActive('/profile') ? 'border-primary' : 'border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <img
              src={user?.image || user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[var(--bg-main)]/95 backdrop-blur-sm border-t border-[var(--border)] z-[60] flex items-center justify-around py-1.5 px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <MobileNavBtn path="/" icon="home" label={t('nav.home')} isActive={isActive} navigate={navigate} />
        <MobileNavBtn path="/feed" icon="dynamic_feed" label={t('nav.feed')} isActive={isActive} navigate={navigate} />
        <MobileNavBtn path="/trading" icon="hub" label={t('nav.trading')} isActive={isActive} navigate={navigate} />
        <MobileNavBtn path="/assets" icon="account_balance_wallet" label={t('nav.assets')} isActive={isActive} navigate={navigate} />

        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMobileMore(!showMobileMore)}
            className={`flex flex-col items-center gap-0.5 w-14 py-1 ${
              ['/media', '/services', '/settings'].some(p => location.pathname.startsWith(p))
                ? 'text-primary' : 'text-[var(--text-tertiary)]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            <span className="text-[10px]">{t('nav.more')}</span>
          </button>

          {showMobileMore && (
            <div className="absolute bottom-full mb-2 right-0 w-44 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-lg shadow-black/20 p-1.5 z-50">
              <MobileMoreItem path="/media" icon="play_circle" label={t('nav.media')} navigate={navigate} close={() => setShowMobileMore(false)} />
              <MobileMoreItem path="/services" icon="widgets" label={t('nav.services')} navigate={navigate} close={() => setShowMobileMore(false)} />
              <MobileMoreItem path="/settings" icon="settings" label={t('nav.settings')} navigate={navigate} close={() => setShowMobileMore(false)} />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

function MobileNavBtn({ path, icon, label, isActive, navigate }) {
  const active = isActive(path);
  return (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-0.5 w-14 py-1 transition-colors ${active ? 'text-primary' : 'text-[var(--text-tertiary)]'}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className={`text-[10px] ${active ? 'font-medium' : ''}`}>{label}</span>
    </button>
  );
}

function MobileMoreItem({ path, icon, label, navigate, close }) {
  return (
    <button
      onClick={() => { navigate(path); close(); }}
      className="w-full px-3 py-2 rounded-lg text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center gap-2.5"
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

export default Header;
