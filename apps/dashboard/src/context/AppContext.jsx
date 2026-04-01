import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const availablePlatforms = {
  trading: [
    { id: 'binance', name: 'Binance', icon: 'toll', color: 'text-[#F3BA2F] bg-[#F3BA2F]/10', fields: ['key', 'secret'] },
    { id: 'bybit', name: 'Bybit', icon: 'trending_up', color: 'text-[#F7A600] bg-[#F7A600]/10', fields: ['key', 'secret'] },
    { id: 'exness', name: 'Exness', icon: 'currency_exchange', color: 'text-[#FFC400] bg-[#FFC400]/10', fields: ['key', 'secret', 'password'] },
    { id: 'okx', name: 'OKX', icon: 'grid_view', color: 'text-white bg-black dark:bg-white/20', fields: ['key', 'secret', 'passphrase'] },
    { id: 'other', name: 'Other (Custom)', icon: 'add_circle', color: 'text-slate-500 bg-slate-500/10', fields: ['key', 'secret'] }
  ],
  social: [
    { id: 'x', name: 'X / Twitter', icon: 'close', color: 'text-white bg-black dark:bg-white/10', fields: ['key', 'secret'] },
    { id: 'telegram', name: 'Telegram Bot', icon: 'send', color: 'text-[#0088CC] bg-[#0088CC]/10', fields: ['token'] },
    { id: 'tiktok', name: 'TikTok', icon: 'music_note', color: 'text-[#FE2C55] bg-[#25F4EE]/10', fields: ['access_token', 'client_secret'] },
    { id: 'instagram', name: 'Instagram', icon: 'camera', color: 'text-[#E1306C] bg-[#E1306C]/10', fields: ['access_token'] },
    { id: 'youtube', name: 'YouTube Shorts', icon: 'play_circle', color: 'text-[#FF0000] bg-[#FF0000]/10', fields: ['api_key', 'client_id'] },
    { id: 'linkedin', name: 'LinkedIn', icon: 'work', color: 'text-[#0077B5] bg-[#0077B5]/10', fields: ['client_id', 'client_secret'] },
    { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'text-[#1877F2] bg-[#1877F2]/10', fields: ['access_token'] },
    { id: 'other', name: 'Other (Custom)', icon: 'add_circle', color: 'text-slate-500 bg-slate-500/10', fields: ['access_token', 'api_key'] }
  ],
  ai: [
    { id: 'openai', name: 'ChatGPT / OpenAI', icon: 'psychology', color: 'text-[#10a37f] bg-[#10a37f]/10', fields: ['key'] },
    { id: 'anthropic', name: 'Anthropic (Claude)', icon: 'auto_awesome', color: 'text-[#D97757] bg-[#D97757]/10', fields: ['key'] },
    { id: 'gemini', name: 'Google Gemini', icon: 'diamond', color: 'text-[#4285F4] bg-[#4285F4]/10', fields: ['key'] },
    { id: 'minimax', name: 'Minimax AI', icon: 'blur_on', color: 'text-[#FF4B4B] bg-[#FF4B4B]/10', fields: ['group_id', 'key'] },
    { id: 'midjourney', name: 'Midjourney API', icon: 'brush', color: 'text-white bg-slate-900 dark:bg-white/10', fields: ['key'] },
    { id: 'other', name: 'Other (Custom)', icon: 'add_circle', color: 'text-slate-500 bg-slate-500/10', fields: ['api_key', 'secret'] }
  ],
  webhooks: [
    { id: 'openclaw', name: 'OpenClaw System', icon: 'hub', color: 'text-primary bg-primary/10', fields: ['endpoint', 'webhook_secret'] },
    { id: 'tradingview', name: 'TradingView Alerts', icon: 'notifications_active', color: 'text-[#1976d2] bg-[#1976d2]/10', fields: ['endpoint', 'webhook_secret'] },
    { id: 'custom', name: 'Custom Webhook', icon: 'link', color: 'text-slate-500 bg-slate-500/10', fields: ['endpoint', 'webhook_secret'] },
    { id: 'other', name: 'Other (Custom)', icon: 'add_circle', color: 'text-slate-500 bg-slate-500/10', fields: ['endpoint', 'token'] }
  ]
};

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const { isAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userConnections, setUserConnections] = useState({
    trading: [],
    social: [],
    ai: [],
    webhooks: []
  });

  const fetchConnections = async () => {
    if (!isAuth) return;
    try {
      setLoading(true);
      const res = await fetch('/api/keys');
      if (!res.ok) {
        if (res.status === 401) {
          console.log('[AppContext] Unauthorized access to /api/keys - logging out or waiting for session');
        }
        return;
      }
      const data = await res.json();
      if (data && data.keys) {
        const grouped = { trading: [], social: [], ai: [], webhooks: [] };
        data.keys.forEach(k => {
          if (grouped[k.category]) {
            grouped[k.category].push({
              id: k.id,
              platformId: k.platformId,
              name: k.name,
              connected: k.isConnected,
              lastSynced: k.lastSyncedAt || 'Never',
              fields: k.fields // Already masked by server
            });
          }
        });
        setUserConnections(grouped);
      }
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [isAuth]);

  const addConnection = async (category, connection) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: connection.platformId,
          category,
          name: connection.name,
          fields: connection.fields,
          isConnected: connection.isConnected
        })
      });
      if (res.ok) {
        await fetchConnections();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const removeConnection = async (category, id) => {
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchConnections();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateConnection = async (category, id, updateData) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        await fetchConnections();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const toggleConnectionStatus = async (category, id) => {
    // Find if current is connected
    const conn = userConnections[category].find(c => c.id === id);
    if (!conn) return;

    try {
      const res = await fetch(`/api/keys/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConnected: !conn.connected })
      });
      if (res.ok) {
        await fetchConnections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    userConnections,
    setUserConnections,
    addConnection,
    removeConnection,
    updateConnection,
    toggleConnectionStatus,
    loading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
