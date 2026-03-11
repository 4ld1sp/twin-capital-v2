import React, { useState } from 'react';
import { Eye, EyeOff, Save, Trash2, CheckCircle2, AlertCircle, Plus, Key, Webhook, X, Edit2, Loader2 } from 'lucide-react';

const apiCategories = [
  { id: 'trading', label: 'Trading Exchanges', icon: 'currency_exchange' },
  { id: 'social', label: 'Social Media', icon: 'share' },
  { id: 'ai', label: 'AI Models', icon: 'smart_toy' },
  { id: 'webhooks', label: 'Webhooks', icon: 'webhook' }
];

const availablePlatforms = {
  trading: [
    { id: 'binance', name: 'Binance', fields: ['key', 'secret'] },
    { id: 'bybit', name: 'Bybit', fields: ['key', 'secret'] },
    { id: 'exness', name: 'Exness', fields: ['key', 'secret', 'password'] },
    { id: 'okx', name: 'OKX', fields: ['key', 'secret', 'passphrase'] }
  ],
  social: [
    { id: 'x', name: 'X / Twitter', fields: ['key', 'secret'] },
    { id: 'telegram', name: 'Telegram Bot', fields: ['token'] },
    { id: 'tiktok', name: 'TikTok', fields: ['access_token', 'client_secret'] },
    { id: 'instagram', name: 'Instagram', fields: ['access_token'] },
    { id: 'youtube', name: 'YouTube Shorts', fields: ['api_key', 'client_id'] },
    { id: 'linkedin', name: 'LinkedIn', fields: ['client_id', 'client_secret'] },
    { id: 'facebook', name: 'Facebook', fields: ['access_token'] }
  ],
  ai: [
    { id: 'openai', name: 'OpenAI', fields: ['key'] },
    { id: 'anthropic', name: 'Anthropic', fields: ['key'] },
    { id: 'midjourney', name: 'Midjourney API', fields: ['key'] }
  ],
  webhooks: [
    { id: 'openclaw', name: 'OpenClaw System', fields: ['endpoint', 'webhook_secret'] },
    { id: 'tradingview', name: 'TradingView Alerts', fields: ['endpoint', 'webhook_secret'] },
    { id: 'custom', name: 'Custom Webhook', fields: ['endpoint', 'webhook_secret'] }
  ]
};

const formatFieldLabel = (field) => {
  return field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function ApiKeysManager() {
  const [activeTab, setActiveTab] = useState('trading');
  const [showSecrets, setShowSecrets] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Dynamic User Connections Data
  const [userConnections, setUserConnections] = useState({
    trading: [
      { id: 'conn-1', platformId: 'binance', name: 'Binance', connected: true, lastSynced: '5 mins ago', fields: { key: 'sk-binance-xxx', secret: 'abc-def-ghi' } }
    ],
    social: [
      { id: 'conn-2', platformId: 'x', name: 'X / Twitter', connected: true, lastSynced: '1 hour ago', fields: { key: 'sk-x-1234', secret: 'oauth-token-xxx' } }
    ],
    ai: [
      { id: 'conn-3', platformId: 'openai', name: 'OpenAI', connected: true, lastSynced: 'Just now', fields: { key: 'sk-proj-xyz...' } }
    ],
    webhooks: [
      { id: 'conn-4', platformId: 'openclaw', name: 'OpenClaw System', connected: true, lastSynced: 'Live', fields: { endpoint: 'https://api.twincapital.com/webhook/openclaw', webhook_secret: 'whsec_1234567890' } }
    ]
  });

  // Add Form State
  const [newConnPlatform, setNewConnPlatform] = useState('');
  const [newConnFields, setNewConnFields] = useState({});
  const [testStatus, setTestStatus] = useState('idle');

  // Edit State
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [editFields, setEditFields] = useState({});

  // Delete State
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  const toggleSecretVisibility = (connectionId, fieldType) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${connectionId}-${fieldType}`]: !prev[`${connectionId}-${fieldType}`]
    }));
  };

  const confirmRemoveConnection = () => {
    if (!connectionToDelete) return;
    
    setUserConnections(prev => ({
      ...prev,
      [connectionToDelete.category]: prev[connectionToDelete.category].filter(conn => conn.id !== connectionToDelete.id)
    }));
    
    if (editingConnectionId === connectionToDelete.id) {
      setEditingConnectionId(null);
      setEditFields({});
    }
    
    setConnectionToDelete(null);
  };

  const handleStartEdit = (item) => {
    setEditingConnectionId(item.id);
    setEditFields({ ...item.fields });
  };

  const handleCancelEdit = () => {
    setEditingConnectionId(null);
    setEditFields({});
  };

  const handleSaveEdit = (category, id) => {
    setUserConnections(prev => ({
      ...prev,
      [category]: prev[category].map(conn => 
        conn.id === id ? { ...conn, fields: { ...editFields } } : conn
      )
    }));
    setEditingConnectionId(null);
    setEditFields({});
  };

  const handleAddConnection = () => {
    if (!newConnPlatform) return;

    const platformDef = availablePlatforms[activeTab].find(p => p.id === newConnPlatform);
    if (!platformDef) return;

    const newConnection = {
      id: `conn-${Date.now()}`,
      platformId: platformDef.id,
      name: platformDef.name,
      connected: false,
      lastSynced: 'Never',
      fields: { ...newConnFields }
    };

    setUserConnections(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newConnection]
    }));

    setShowAddModal(false);
    setNewConnPlatform('');
    setNewConnFields({});
    setTestStatus('idle');
  };

  const handleTestNewConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
    }, 1500);
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;
    const platformsMenu = availablePlatforms[activeTab] || [];
    const selectedPlatformDef = platformsMenu.find(p => p.id === newConnPlatform);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add {apiCategories.find(c => c.id === activeTab)?.label}</h3>
            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Platform</label>
              <select 
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={newConnPlatform}
                onChange={e => {
                  setNewConnPlatform(e.target.value);
                  setNewConnFields({});
                  setTestStatus('idle');
                }}
              >
                <option value="" disabled>-- Choose a platform --</option>
                {platformsMenu.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedPlatformDef && selectedPlatformDef.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{formatFieldLabel(field)}</label>
                <input 
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder={`Enter ${formatFieldLabel(field)}`}
                  value={newConnFields[field] || ''}
                  onChange={e => {
                    setNewConnFields(prev => ({...prev, [field]: e.target.value}));
                    setTestStatus('idle');
                  }}
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-3">
             <button 
               onClick={handleTestNewConnection} 
               disabled={!newConnPlatform || Object.keys(newConnFields).length === 0 || testStatus === 'testing' || testStatus === 'success'} 
               className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
               {testStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
               {testStatus === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : null}
               {testStatus === 'success' ? 'Verified' : 'Test Connection'}
             </button>
             
             <div className="flex gap-2">
               <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                 Cancel
               </button>
               <button disabled={testStatus !== 'success'} onClick={handleAddConnection} className="px-4 py-2 text-sm font-medium text-white bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover rounded-lg transition-colors">
                 Save Connection
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!connectionToDelete) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Remove Connection
            </h3>
            <button onClick={() => setConnectionToDelete(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong>{connectionToDelete.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
             <button onClick={() => setConnectionToDelete(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
               Cancel
             </button>
             <button onClick={confirmRemoveConnection} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
               Yes, Remove
             </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderConnectionCards = () => {
    const currentList = userConnections[activeTab] || [];

    if (currentList.length === 0) {
      return (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
             <Key className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-medium mb-1">No connections yet</h3>
          <p className="text-sm text-slate-500 mb-4">You haven't added any {apiCategories.find(c => c.id === activeTab)?.label} keys.</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors">
            <Plus className="w-4 h-4" /> Add your first connection
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentList.map((item) => (
          <div key={item.id} className="bg-slate-50 dark:bg-primary/5 rounded-xl p-5 border border-slate-200 dark:border-primary/10 hover:border-primary/30 transition-colors group relative">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  item.connected ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    {item.connected ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <AlertCircle className="w-3 h-3" /> Setup Pending
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-slate-500 dark:text-slate-400">Synced: {item.lastSynced}</span>
                  </div>
                </div>
              </div>

              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  {editingConnectionId !== item.id && (
                    <button onClick={() => handleStartEdit(item)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" title="Edit Connection">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setConnectionToDelete({ category: activeTab, ...item })} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" title="Remove Connection">
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(item.fields).map(([fieldKey, fieldValue]) => {
                const isSecret = fieldKey.includes('secret') || fieldKey.includes('key') || fieldKey.includes('token') || fieldKey.includes('password');
                const fieldType = isSecret && !showSecrets[`${item.id}-${fieldKey}`] ? 'password' : 'text';

                return (
                  <div key={fieldKey} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {formatFieldLabel(fieldKey)}
                    </label>
                    <div className="relative flex rounded-lg overflow-hidden border border-slate-200 dark:border-primary/20 bg-white dark:bg-black/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <input 
                        type={fieldType}
                        value={editingConnectionId === item.id ? editFields[fieldKey] || '' : fieldValue}
                        onChange={e => {
                          if (editingConnectionId === item.id) {
                            setEditFields(prev => ({...prev, [fieldKey]: e.target.value}));
                          }
                        }}
                        readOnly={editingConnectionId !== item.id}
                        className={`flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none w-full ${editingConnectionId === item.id ? '' : 'opacity-70'}`}
                      />
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(item.id, fieldKey)}
                          className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showSecrets[`${item.id}-${fieldKey}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
                {editingConnectionId === item.id ? (
                  <>
                    <button onClick={handleCancelEdit} className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-primary/20 rounded-md hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => handleSaveEdit(activeTab, item.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-primary/20 rounded-md hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
                      Test Connection
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </>
                )}
            </div>

          </div>
        ))}

        {/* Add Connection Card */}
        <button onClick={() => setShowAddModal(true)} className="min-h-[200px] bg-transparent border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all outline-none">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Plus className="w-5 h-5 current-color" />
          </div>
          <span className="font-medium">Add New {apiCategories.find(c => c.id === activeTab)?.label}</span>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-primary/5 rounded-2xl border border-slate-200 dark:border-primary/20 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-primary/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Connections
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage dynamic API integrations and Webhooks.</p>
          </div>
          {activeTab && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Connection
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-primary/10 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-black/10 px-4">
          {apiCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === cat.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {renderConnectionCards()}
        </div>
      </div>

      {renderAddModal()}
      {renderDeleteModal()}
    </>
  );
}
