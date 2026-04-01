import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Info, AlertTriangle, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const LogsTable = ({ searchQuery, filterLevel, filterScope }) => {
  const { activityLogs } = useAuth();

  const getLevelBadge = (type) => {
    switch (type.toLowerCase()) {
      case 'error':
        return <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Error</span>;
      case 'warn':
      case 'security':
        return <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Warning</span>;
      case 'login':
      case 'update':
        return <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Success</span>;
      default:
        return <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-widest flex items-center gap-1 w-fit"><Info className="w-3 h-3" /> Info</span>;
    }
  };

  const filteredLogs = activityLogs.filter(log => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                         log.action.toLowerCase().includes(searchLower) || 
                         log.details.toLowerCase().includes(searchLower);
    
    const matchesLevel = filterLevel === 'All' || 
                        (filterLevel === 'Info' && (log.type === 'system' || log.type === 'login')) ||
                        (filterLevel === 'Warn' && (log.type === 'security' || log.type === 'warn')) ||
                        (filterLevel === 'Error' && log.type === 'error');

    const matchesScope = filterScope === 'All Scopes' || 
                        (filterScope === 'API Config' && log.action.includes('API')) ||
                        (filterScope === 'Security' && log.type === 'security') ||
                        (filterScope === 'System' && log.type === 'system');

    return matchesSearch && matchesLevel && matchesScope;
  });

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="flex-1 glass-card border border-glass rounded-2xl overflow-hidden flex flex-col mt-6 shadow-sm min-h-[400px]">
      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-black/5 dark:bg-white/5 border-b border-glass z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-48">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-32">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-48">Aksi</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Rincian Aktivitas</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary w-24">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[11px] text-secondary font-bold whitespace-nowrap">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    {getLevelBadge(log.type)}
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-main uppercase tracking-wider">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-xs text-secondary font-bold">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 text-secondary hover:text-primary transition-all rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <span className="material-symbols-outlined text-4xl">search_off</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">No matching audit logs found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-glass flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-60">
          Showing {filteredLogs.length} of {activityLogs.length} events
        </p>
        <div className="flex items-center gap-4">
           <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Live Stream Active</span>
           <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(20,241,149,0.5)]"></div>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;
