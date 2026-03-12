import React, { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Feed from './pages/Feed'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { isAuth, login } = useAuth()
  const [currentView, setCurrentView] = useState('feed')

  if (!isAuth) {
    return <Login onLogin={login} />
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen w-full bg-main overflow-x-hidden text-main transition-colors duration-300">
      <div className="layout-container flex h-full grow flex-col">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8 pb-24 lg:pb-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'feed' && <Feed />}
          {currentView === 'trading' && <Trading />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'media' && <Media />}
          {currentView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
