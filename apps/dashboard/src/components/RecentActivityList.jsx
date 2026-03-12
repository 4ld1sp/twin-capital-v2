import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHrs = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHrs / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const RecentActivityList = () => {
  const { activityLogs } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination logic
  const totalPages = Math.ceil(activityLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const expandedLogs = activityLogs.slice(startIndex, startIndex + itemsPerPage);
  
  // Summary view (first 3)
  const summaryLogs = activityLogs.slice(0, 3);

  const displayLogs = isExpanded ? expandedLogs : summaryLogs;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    setCurrentPage(1); // Reset to first page when toggling
  };

  return (
    <div className={`glass-card rounded-3xl border border-glass p-6 shadow-sm transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
          Recent Activity
        </h3>
        <button 
          onClick={handleToggleExpand}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-main transition-colors group"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-4 h-4" />
              Collapse View
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              View Full History
            </>
          )}
        </button>
      </div>
      
      {activityLogs.length === 0 ? (
        <div className="text-center py-6 text-sm text-secondary">No recent activity found.</div>
      ) : (
        <div className="space-y-4">
          <div className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'} gap-4 transition-all duration-500`}>
            {displayLogs.map((activity) => (
              <div 
                key={activity.id} 
                className="p-5 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-glass flex flex-col justify-center hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <p className="text-[10px] text-secondary font-black uppercase tracking-widest">{timeAgo(activity.timestamp)}</p>
                  {isExpanded && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  )}
                </div>
                <p className="text-sm font-black text-main truncate" title={activity.action}>{activity.action}</p>
                <p className="text-xs text-secondary font-bold truncate mt-1" title={activity.details}>{activity.details}</p>
              </div>
            ))}
          </div>

          {isExpanded && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-glass mt-6">
              <p className="text-[10px] text-secondary font-black uppercase tracking-widest">
                <span className="text-primary">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, activityLogs.length)}</span> of <span className="text-main">{activityLogs.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-glass text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 px-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        currentPage === page 
                        ? 'bg-primary text-black' 
                        : 'text-secondary hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-glass text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentActivityList;
