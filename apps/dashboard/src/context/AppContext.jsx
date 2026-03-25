import React, { createContext, useContext, useState, useEffect } from 'react';

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
    { id: 'openai', name: 'OpenAI', icon: 'psychology', color: 'text-[#10a37f] bg-[#10a37f]/10', fields: ['key'] },
    { id: 'anthropic', name: 'Anthropic', icon: 'auto_awesome', color: 'text-[#D97757] bg-[#D97757]/10', fields: ['key'] },
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
  const [userConnections, setUserConnections] = useState({
    trading: [
      { id: 'conn-1', platformId: 'binance', name: 'Binance', connected: true, lastSynced: '5 mins ago', fields: { key: 'sk-binance-xxx', secret: 'abc-def-ghi' } }
    ],
    social: [
      { id: 'conn-2', platformId: 'x', name: 'X / Twitter', connected: true, lastSynced: '1 hour ago', fields: { key: 'sk-x-1234', secret: 'oauth-token-xxx' }, stats: { followers: 1250, change: '+12%', history: [40, 45, 42, 48, 55, 60, 62] } },
      { id: 'conn-5', platformId: 'instagram', name: 'Instagram', connected: true, lastSynced: '10 mins ago', fields: { access_token: 'ig-token-xxx' }, stats: { followers: 100, change: '+5%', history: [30, 32, 35, 34, 38, 40, 42] } },
      { id: 'conn-6', platformId: 'youtube', name: 'YouTube Shorts', connected: true, lastSynced: '2 hours ago', fields: { api_key: 'yt-key-xxx' }, stats: { subscribers: 1000, change: '+20%', history: [70, 75, 80, 85, 90, 95, 100] } },
      { id: 'conn-7', platformId: 'facebook', name: 'Facebook', connected: true, lastSynced: '1 day ago', fields: { access_token: 'fb-token-xxx' }, stats: { followers: 50, change: '-2%', history: [25, 24, 26, 25, 23, 24, 22] } }
    ],
    ai: [
      { id: 'conn-3', platformId: 'openai', name: 'OpenAI', connected: true, lastSynced: 'Just now', fields: { key: 'sk-proj-xyz...' } }
    ],
    webhooks: [
      { id: 'conn-4', platformId: 'openclaw', name: 'OpenClaw System', connected: true, lastSynced: 'Live', fields: { endpoint: 'https://api.twincapital.com/webhook/openclaw', webhook_secret: 'whsec_1234567890' } }
    ]
  });

  const addConnection = (category, connection) => {
    setUserConnections(prev => ({
      ...prev,
      [category]: [...prev[category], connection]
    }));
  };

  const removeConnection = (category, id) => {
    setUserConnections(prev => ({
      ...prev,
      [category]: prev[category].filter(conn => conn.id !== id)
    }));
  };

  const updateConnection = (category, id, fields) => {
    setUserConnections(prev => ({
      ...prev,
      [category]: prev[category].map(conn => 
        conn.id === id ? { ...conn, fields: { ...fields } } : conn
      )
    }));
  };

  const toggleConnectionStatus = (category, id) => {
    setUserConnections(prev => ({
      ...prev,
      [category]: prev[category].map(conn => 
        conn.id === id ? { ...conn, connected: !conn.connected } : conn
      )
    }));
  };

  const value = {
    userConnections,
    setUserConnections,
    addConnection,
    removeConnection,
    updateConnection,
    toggleConnectionStatus
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
