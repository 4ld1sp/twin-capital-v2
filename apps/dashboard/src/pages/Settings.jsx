import React, { useState } from 'react';
import ApiKeysManager from '../components/ApiKeysManager';

// Logs Components (from Trading section)
import LogsHeader from '../components/trading/LogsHeader';
import LogsFilterBar from '../components/trading/LogsFilterBar';
import LogsTable from '../components/trading/LogsTable';
import LogsSystemStatus from '../components/trading/LogsSystemStatus';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('api_config');

  const renderApiConfig = () => (
    <div className="w-full mt-4">
      <ApiKeysManager />
    </div>
  );

  const renderLogs = () => (
    <div className="w-full flex flex-col mt-4">
      <LogsFilterBar />
      <LogsTable />
      <LogsSystemStatus />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6">
        <div>
          <h1 className="text-2xl font-black text-main uppercase tracking-tight">System Settings</h1>
          <p className="text-sm text-secondary mt-1 font-bold">Manage your technical configurations and system audit logs.</p>
        </div>
        
        <nav className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab('api_config')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'api_config' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            API Config
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Logs
          </button>
        </nav>
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'api_config' && renderApiConfig()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </div>
  );
}
