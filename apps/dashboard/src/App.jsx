import React, { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Feed from './pages/Feed'
import Assets from './pages/Assets'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import TwoFactorAuth from './pages/TwoFactorAuth'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuth, is2FANeeded, isRegistering, isSessionPending } = useAuth()
  const [currentView, setCurrentView] = useState('feed')
  const [authView, setAuthView] = useState('login')

  if (isSessionPending && !isRegistering) {
    return (
      <div className="h-screen w-full bg-main flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-black italic uppercase tracking-widest text-[10px] animate-pulse">Establishing Identity...</p>
        </div>
      </div>
    )
  }

  if (!isAuth || isRegistering) {
    if (is2FANeeded) return <TwoFactorAuth onNavigate={setAuthView} />
    if (authView === 'login') return <Login onNavigate={setAuthView} />
    if (authView === 'register') return <Register onNavigate={setAuthView} />
    if (authView === 'forgot-password') return <ForgotPassword onNavigate={setAuthView} />
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen w-full bg-main overflow-x-hidden text-main transition-colors duration-300">
      <div className="layout-container flex h-full grow flex-col">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8 pb-24 lg:pb-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'feed' && <Feed />}
          {currentView === 'trading' && <Trading />}
          {currentView === 'assets' && <Assets />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'media' && <Media />}
          {currentView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
