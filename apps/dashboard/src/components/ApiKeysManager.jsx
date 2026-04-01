import React, { useState } from 'react';
import { Eye, EyeOff, Save, Trash2, CheckCircle2, AlertCircle, Plus, Key, Webhook, X, Edit2, Loader2 } from 'lucide-react';
import { useApp, availablePlatforms } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const apiCategories = [
  { id: 'trading', label: 'Trading Exchanges', icon: 'currency_exchange' },
  { id: 'social', label: 'Social Media', icon: 'share' },
  { id: 'ai', label: 'AI Models', icon: 'smart_toy' },
  { id: 'webhooks', label: 'Webhooks', icon: 'webhook' }
];



const formatFieldLabel = (field) => {
  return field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function ApiKeysManager() {
  const [activeTab, setActiveTab] = useState('trading');
  const [showSecrets, setShowSecrets] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState('');
  
  const { userConnections, setUserConnections, addConnection, removeConnection, updateConnection } = useApp();
  const { logActivity } = useAuth();

  // Add Form State
  const [newConnPlatform, setNewConnPlatform] = useState('');
  const [newConnFields, setNewConnFields] = useState({});
  const [customFieldsArray, setCustomFieldsArray] = useState([{ name: 'API Key', value: '' }]);
  const [testStatus, setTestStatus] = useState('idle');

  // Edit State
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [editTestStatus, setEditTestStatus] = useState('idle'); // 'idle'|'testing'|'success'|'error'
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  const toggleSecretVisibility = (connectionId, fieldType) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${connectionId}-${fieldType}`]: !prev[`${connectionId}-${fieldType}`]
    }));
  };

  const confirmRemoveConnection = async () => {
    if (!connectionToDelete) return;
    
    if (editingConnectionId === connectionToDelete.id) {
      setEditingConnectionId(null);
      setEditFields({});
    }
    
    const success = await removeConnection(connectionToDelete.category, connectionToDelete.id);
    if (success) {
      logActivity('API Key Removed', `${connectionToDelete.name} connection deleted from ${connectionToDelete.category}`, 'security');
    }
    setConnectionToDelete(null);
  };

  const handleStartEdit = (item) => {
    setEditingConnectionId(item.id);
    setEditFields({ ...item.fields });
    setEditTestStatus('idle');
  };

  const handleCancelEdit = () => {
    setEditingConnectionId(null);
    setEditFields({});
    setEditTestStatus('idle');
  };

  const handleSaveEdit = async (category, id) => {
    if (isSaving) return;
    setIsSaving(true);
    const success = await updateConnection(category, id, { 
      fields: editFields,
      isConnected: editTestStatus === 'success'
    });
    setIsSaving(false);
    if (success) {
      logActivity('API Config Updated', `${category.toUpperCase()}: ${id} updated`, 'update');
      setEditingConnectionId(null);
      setEditFields({});
      setEditTestStatus('idle');
    }
  };

  const handleTestEditConnection = async (item) => {
    setEditTestStatus('testing');
    // Use editFields if actively editing, otherwise use item's stored fields
    const fieldsToTest = editingConnectionId === item.id ? editFields : item.fields;
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: item.platformId,
          fields: fieldsToTest
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditTestStatus('success');
        // If not editing, auto-update connection status to Connected
        if (editingConnectionId !== item.id) {
          await updateConnection(activeTab, item.id, { isConnected: true });
        }
      } else {
        setEditTestStatus('error');
        alert(`Connection test failed: ${data.message || data.error}`);
      }
    } catch (err) {
      setEditTestStatus('error');
      alert('Network error while testing connection.');
    }
  };

  const handleAddConnection = async () => {
    if (!newConnPlatform) return;

    const platformDef = availablePlatforms[activeTab].find(p => p.id === newConnPlatform);
    if (!platformDef) return;

    // Build the final fields object depending on if it's custom or predefined
    let finalFields = {};
    if (newConnPlatform === 'other') {
      customFieldsArray.forEach(f => {
        if (f.name.trim()) finalFields[f.name.trim().toLowerCase().replace(/\s+/g, '_')] = f.value;
      });
    } else {
      finalFields = { ...newConnFields };
    }

    if (isSaving) return;
    setIsSaving(true);
    const newConnection = {
      platformId: platformDef.id,
      name: platformDef.id === 'other' ? customPlatformName : platformDef.name,
      fields: finalFields,
      isConnected: testStatus === 'success'
    };
    const success = await addConnection(activeTab, newConnection);
    setIsSaving(false);
    if (success) {
      logActivity('API Key Created', `${newConnection.name} connection added to ${activeTab}`, 'update');
    }
    setShowAddModal(false);
    setIsDropdownOpen(false);
    setNewConnPlatform('');
    setCustomPlatformName('');
    setNewConnFields({});
    setCustomFieldsArray([{ name: 'API Key', value: '' }]);
    setTestStatus('idle');
  };

  const handleTestNewConnection = async () => {
    setTestStatus('testing');
    logActivity('API Connection Test', `Testing connectivity to ${newConnPlatform === 'other' ? customPlatformName : newConnPlatform}...`, 'system');
    
    let finalFields = {};
    if (newConnPlatform === 'other') {
      customFieldsArray.forEach(f => {
        if (f.name.trim()) finalFields[f.name.trim().toLowerCase().replace(/\s+/g, '_')] = f.value;
      });
    } else {
      finalFields = { ...newConnFields };
    }

    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: newConnPlatform === 'other' ? 'custom' : newConnPlatform,
          fields: finalFields
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTestStatus('success');
        logActivity('API Connection Success', `Verification successful for ${newConnPlatform || 'custom platform'} (${data.latency}ms)`, 'system');
      } else {
        setTestStatus('idle'); // or 'error' if we want to add an error state
        alert(`Connection test failed: ${data.message || data.error}`);
        logActivity('API Connection Failed', `Verification failed for ${newConnPlatform}: ${data.message || data.error}`, 'error');
      }
    } catch (err) {
      console.error(err);
      setTestStatus('idle');
      alert('Network error while testing connection.');
    }
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;
    const platformsMenu = availablePlatforms[activeTab] || [];
    const selectedPlatformDef = platformsMenu.find(p => p.id === newConnPlatform);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add {apiCategories.find(c => c.id === activeTab)?.label}</h3>
            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Platform</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
                    isDropdownOpen 
                      ? 'border-primary ring-2 ring-primary/20 bg-white dark:bg-slate-900 shadow-lg' 
                      : 'border-slate-200 dark:border-primary/10 bg-black/5 dark:bg-black/40 hover:bg-black/10 dark:hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedPlatformDef ? (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedPlatformDef.color}`}>
                        <span className="material-symbols-outlined text-[18px]">{selectedPlatformDef.icon}</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">category</span>
                      </div>
                    )}
                    <span className={`text-sm font-medium ${selectedPlatformDef ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                      {selectedPlatformDef ? selectedPlatformDef.name : 'Choose a platform'}
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[110] bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-primary/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                    <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                      {platformsMenu.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setNewConnPlatform(p.id);
                            setNewConnFields({});
                            setTestStatus('idle');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                            newConnPlatform === p.id 
                              ? 'bg-primary/10 text-primary font-bold' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${p.color}`}>
                            <span className="material-symbols-outlined text-[18px]">{p.icon}</span>
                          </div>
                          <span className="text-sm">{p.name}</span>
                          {newConnPlatform === p.id && (
                            <span className="material-symbols-outlined text-[18px] ml-auto">check_circle</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {newConnPlatform === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">What's the platform name?</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                    placeholder="e.g. Mexc Exchange, DeepSeek, dll."
                    value={customPlatformName}
                    onChange={e => {
                      setCustomPlatformName(e.target.value);
                      setTestStatus('idle');
                    }}
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Custom Fields</label>
                     <button
                        type="button"
                        onClick={() => setCustomFieldsArray([...customFieldsArray, { name: '', value: '' }])}
                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                     >
                       <Plus className="w-3 h-3" /> Add Field
                     </button>
                  </div>
                  
                  <div className="space-y-3">
                    {customFieldsArray.map((field, idx) => (
                      <div key={idx} className="flex gap-2 items-start relative group">
                         <div className="w-1/3">
                            <input 
                              type="text"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-black/5 dark:bg-white/5 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="Field Name"
                              value={field.name}
                              onChange={e => {
                                 const newArr = [...customFieldsArray];
                                 newArr[idx].name = e.target.value;
                                 setCustomFieldsArray(newArr);
                                 setTestStatus('idle');
                              }}
                            />
                         </div>
                         <div className="w-2/3 flex gap-2">
                            <input 
                              type="text"
                              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              placeholder="Value (Secret/Token/Key)"
                              value={field.value}
                              onChange={e => {
                                 const newArr = [...customFieldsArray];
                                 newArr[idx].value = e.target.value;
                                 setCustomFieldsArray(newArr);
                                 setTestStatus('idle');
                              }}
                            />
                            {customFieldsArray.length > 1 && (
                               <button 
                                 type="button" 
                                 onClick={() => {
                                    const newArr = [...customFieldsArray];
                                    newArr.splice(idx, 1);
                                    setCustomFieldsArray(newArr);
                                 }}
                                 className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-6 top-2"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedPlatformDef && newConnPlatform !== 'other' && selectedPlatformDef.fields.map(field => (
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
          <div key={item.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors group relative">
            
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
                    <div className="relative flex rounded-lg overflow-hidden border border-slate-200 dark:border-primary/10 bg-black/5 dark:bg-black/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
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
                    <button
                      onClick={() => handleTestEditConnection(item)}
                      disabled={editTestStatus === 'testing'}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-primary/20 rounded-md hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {editTestStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {editTestStatus === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : null}
                      {editTestStatus === 'success' ? 'Verified' : 'Test Connection'}
                    </button>
                    <button
                      onClick={() => handleSaveEdit(activeTab, item.id)}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleTestEditConnection(item)}
                      disabled={editTestStatus === 'testing'}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-primary/20 rounded-md hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {editTestStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {editTestStatus === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : null}
                      {editTestStatus === 'success' ? 'Verified' : 'Retest Connection'}
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
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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

        {/* Sub-Navigation (Matching Trading & Media Pages) */}
        <div className="px-6 py-2 bg-slate-50/30 dark:bg-black/20">
          <nav className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-fit">
            {apiCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === cat.id 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </nav>
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
