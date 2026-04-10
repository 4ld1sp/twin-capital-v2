import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiKeysManager from '../components/ApiKeysManager';
import Billing from './Billing';
import Organization from './Organization';

// Logs Components
import LogsFilterBar from '../components/trading/LogsFilterBar';
import LogsTable from '../components/trading/LogsTable';
import LogsSystemStatus from '../components/trading/LogsSystemStatus';

const TABS = [
  { key: 'api_config', label: 'API Config', path: '/settings' },
  { key: 'logs', label: 'Logs', path: '/settings' },
  { key: 'billing', label: 'Billing', path: '/settings/billing' },
  { key: 'team', label: 'Team', path: '/settings/team' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('api_config');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterScope, setFilterScope] = useState('All Scopes');
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab.key === 'billing') return navigate('/settings/billing');
    if (tab.key === 'team') return navigate('/settings/team');
    setActiveTab(tab.key);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage configurations, billing, and team.</p>
        </div>

        <nav className="flex items-center gap-1 border-b border-[var(--border)] overflow-x-auto w-full md:w-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key ? 'text-primary border-primary' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="w-full">
        {activeTab === 'api_config' && <ApiKeysManager />}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-6">
            <LogsFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterLevel={filterLevel}
              setFilterLevel={setFilterLevel}
              filterScope={filterScope}
              setFilterScope={setFilterScope}
            />
            <LogsTable
              searchQuery={searchQuery}
              filterLevel={filterLevel}
              filterScope={filterScope}
            />
            <LogsSystemStatus />
          </div>
        )}
      </div>
    </div>
  );
}
