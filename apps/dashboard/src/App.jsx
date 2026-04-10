import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Profile from './pages/Profile'
import Media from './pages/Media'
import Feed from './pages/Feed'
import Assets from './pages/Assets'
import Settings from './pages/Settings'
import Services from './pages/Services'
import Billing from './pages/Billing'
import Organization from './pages/Organization'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import TwoFactorAuth from './pages/TwoFactorAuth'
import { useAuth } from './context/AuthContext'

function AuthRouter() {
  const [authView, setAuthView] = React.useState('login')
  const { is2FANeeded } = useAuth()

  if (is2FANeeded) return <TwoFactorAuth onNavigate={setAuthView} />
  if (authView === 'register') return <Register onNavigate={setAuthView} />
  if (authView === 'forgot-password') return <ForgotPassword onNavigate={setAuthView} />
  return <Login onNavigate={setAuthView} />
}

function AppLayout() {
  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen w-full bg-[var(--bg-main)] overflow-x-hidden text-[var(--text-primary)]">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8 pb-24 lg:pb-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trading" element={<Trading />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/media" element={<Media />} />
            <Route path="/services" element={<Services />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/billing" element={<Billing />} />
            <Route path="/settings/team" element={<Organization />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuth, is2FANeeded, isRegistering, isSessionPending } = useAuth()

  if (isSessionPending && !isRegistering) {
    return (
      <div className="h-screen w-full bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-xs font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuth || isRegistering) {
    return <AuthRouter />
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
