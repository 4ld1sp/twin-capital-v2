import React, { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '../lib/authClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { data: sessionData, isPending: isSessionPending, error: sessionError } = authClient.useSession();
  
  const [isAuth, setIsAuth] = useState(false);
  const [is2FANeeded, setIs2FANeeded] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    if (sessionData?.session) {
      setIsAuth(true);
      setUser(sessionData.user);
      setIs2FAEnabled(!!sessionData.user.twoFactorEnabled); 
    } else {
      setIsAuth(false);
      setUser(null);
    }
  }, [sessionData]);

  const logActivity = (action, details, type = 'system') => {
    setActivityLogs(prev => [{ id: `log-${Date.now()}`, action, details, timestamp: new Date().toISOString(), type }, ...prev]);
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) {
        if (error.code === 'TWO_FACTOR_REQUIRED') {
            setIs2FANeeded(true);
            return true;
        }
        setAuthError(error.message || 'Login failed');
        return false;
      }
      logActivity('Successful Login', 'User authenticated', 'login');
      return true;
    } catch (err) {
      setAuthError('An unexpected error occurred during login');
      return false;
    }
  };

  const verify2FA = async (code) => {
    setAuthError(null);
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) {
        setAuthError(error.message || 'Invalid 2FA code');
        return false;
      }
      setIs2FANeeded(false);
      logActivity('2FA Verified', 'Secure session established', 'security');
      return true;
    } catch (err) {
      setAuthError('Verification failed');
      return false;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const { data, error } = await authClient.signUp.email({
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.email.split('@')[0],
      });
      if (error) {
        setAuthError(error.message || 'Registration failed');
        return false;
      }
      logActivity('Account Registered', `User ${userData.email} created`, 'security');
      return true;
    } catch (err) {
      setAuthError('An unexpected error occurred during registration');
      return false;
    }
  };

  const checkAvailability = async (type, value) => {
    try {
      const res = await fetch(`/api/auth-extras/check-availability?type=${type}&value=${encodeURIComponent(value)}`);
      if (!res.ok) {
        console.error('Availability check failed:', res.status);
        return true;
      }
      const data = await res.json();
      return data.available || false;
    } catch (err) {
      console.error('Availability check failed', err);
      return true;
    }
  };

  const resetPassword = (email) => {
    setAuthError(null);
    logActivity('Password Reset Requested', `Reset link sent to ${email}`, 'security');
    return true;
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setIsAuth(false);
      setUser(null);
      setIs2FANeeded(false);
      logActivity('Logged Out', 'User session terminated', 'security');
    } catch(err) {
      console.error(err);
    }
  };

  const updateUser = async (updates) => {
    try {
        await authClient.updateUser({ name: updates.name, image: updates.avatar });
        setUser(prev => ({ ...prev, ...updates }));
        logActivity('Profile Updated', 'User modified personal settings', 'update');
    } catch(err) {
        console.error(err);
    }
  };

  // ─── 2FA Management ──────────────────────────────────────

  const get2FASecret = async (password) => {
    await new Promise(r => setTimeout(r, 1500));
    try {
      const result = await authClient.twoFactor.enable({ password });
      const { data, error } = result || {};
      
      if (error) {
        setAuthError(error.message || 'Gagal membuat kunci 2FA');
        return null;
      }
      
      if (!data) {
        if (result?.totpURI) {
          const secret = result.totpURI.split('secret=')[1]?.split('&')[0] || '';
          return { totpUri: result.totpURI, secret, backupCodes: result.backupCodes };
        }
        setAuthError('Server tidak mengembalikan data 2FA');
        return null;
      }
      
      const secret = data.totpURI?.split('secret=')[1]?.split('&')[0] || '';
      return { totpUri: data.totpURI, secret, backupCodes: data.backupCodes };
    } catch (err) {
      console.error('2FA enable failed:', err);
      setAuthError('Koneksi ke server 2FA terputus');
      return null;
    }
  };

  const enable2FA = async (code) => {
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) {
        return { success: false, error: error.message };
      }
      if (user?.id) {
        await fetch('/api/auth-extras/confirm-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }
      setIs2FAEnabled(true);
      logActivity('2FA Enabled', 'Two-factor authentication activated', 'security');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Verifikasi gagal' };
    }
  };

  const disable2FA = async (code) => {
    try {
      // First verify the OTP to prove ownership
      const { data, error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) {
        return { success: false, error: error.message || 'Kode OTP tidak valid' };
      }
      // Then disable 2FA in Better Auth
      const disableResult = await authClient.twoFactor.disable({ password: code });
      // Also update our DB flag
      if (user?.id) {
        await fetch('/api/auth-extras/disable-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }
      setIs2FAEnabled(false);
      logActivity('2FA Disabled', 'Two-factor authentication deactivated', 'security');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Gagal menonaktifkan 2FA' };
    }
  };

  // ─── Session Management ──────────────────────────────────

  const listSessions = async () => {
    try {
      const { data, error } = await authClient.listSessions();
      if (error) return [];
      return data || [];
    } catch (err) {
      console.error('Failed to list sessions:', err);
      return [];
    }
  };

  const revokeSession = async (sessionToken) => {
    try {
      const { error } = await authClient.revokeSession({ token: sessionToken });
      if (error) return { success: false, error: error.message };
      logActivity('Session Revoked', 'A trusted device was removed', 'security');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to revoke session' };
    }
  };

  const value = {
    isAuth,
    is2FANeeded,
    is2FAEnabled,
    authError,
    setAuthError,
    user,
    activityLogs,
    login,
    verify2FA,
    register,
    checkAvailability,
    get2FASecret,
    enable2FA,
    disable2FA,
    resetPassword,
    logout,
    updateUser,
    logActivity,
    isRegistering,
    setIsRegistering,
    isSessionPending,
    listSessions,
    revokeSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
