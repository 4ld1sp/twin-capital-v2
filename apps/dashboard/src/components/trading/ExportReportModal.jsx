import React from 'react';

const ExportReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-card border border-glass w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-lg">
            <span className="material-symbols-outlined text-3xl text-primary">download</span>
          </div>
          <h2 className="text-sm font-black text-main uppercase tracking-widest mb-2">Export Report</h2>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60 mb-8">Select output format</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-black/5 dark:bg-white/5 border border-glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-main"
            >
              <span className="material-symbols-outlined text-rose-500">picture_as_pdf</span>
              PDF Document
            </button>
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-black/5 dark:bg-white/5 border border-glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-main"
            >
              <span className="material-symbols-outlined text-emerald-500">table_view</span>
              Excel Spreadsheet
            </button>
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-black/5 dark:bg-white/5 border border-glass rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-main"
            >
              <span className="material-symbols-outlined text-blue-500">html</span>
              Interactive HTML
            </button>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="mt-8 text-[10px] font-black text-secondary uppercase tracking-widest hover:text-main transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
