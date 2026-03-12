import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState({
    name: 'Aldis',
    email: 'admin@twincapital.com',
    role: 'System Administrator',
    avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    phone: '+1 234 567 8900',
    timezone: 'UTC - Eastern Time',
    language: 'English (US)'
  });
  
  const [activityLogs, setActivityLogs] = useState([]);

  // Mock initial load from localStorage if we had one
  useEffect(() => {
    // Just seeding some fake history once per session
    setActivityLogs([
      { id: 'start-1', action: 'System Initialization', details: 'Dashboard environment loaded', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'system' },
      { id: 'start-2', action: 'API Connection', details: 'Websocket connected to Binance', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'system' },
      { id: 'start-3', action: 'Portfolio Rebalance', details: 'Automatic rebalancing complete', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'update' },
      { id: 'start-4', action: 'Security Scan', details: 'No vulnerabilities found', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'security' },
      { id: 'start-5', action: 'Login from New Device', details: 'iPhone 14 Pro detected', timestamp: new Date(Date.now() - 259200000).toISOString(), type: 'security' },
      { id: 'start-6', action: 'Daily Report Generated', details: 'Report sent to aldis@twincapital.com', timestamp: new Date(Date.now() - 345600000).toISOString(), type: 'system' },
      { id: 'start-7', action: 'Backup Successful', details: 'Cloud storage sync complete', timestamp: new Date(Date.now() - 432000000).toISOString(), type: 'system' },
      { id: 'start-8', action: 'Target Audience Sync', details: 'Facebook network synced', timestamp: new Date(Date.now() - 518400000).toISOString(), type: 'update' }
    ]);
  }, []);

  const logActivity = (action, details, type = 'system') => {
    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action,
        details,
        timestamp: new Date().toISOString(),
        type
      },
      ...prev
    ]);
  };

  const login = () => {
    setIsAuth(true);
    logActivity('Successful Login', 'User authenticated via email/password', 'login');
  };

  const logout = () => {
    logActivity('Logged Out', 'User session terminated manually', 'security');
    // small delay to show logout animation in UI before actually unmounting
    setTimeout(() => {
      setIsAuth(false);
    }, 500);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    logActivity('Profile Updated', 'User modified personal settings', 'update');
  };

  const value = {
    isAuth,
    user,
    activityLogs,
    login,
    logout,
    updateUser,
    logActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
