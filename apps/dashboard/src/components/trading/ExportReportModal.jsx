import React from 'react';

const ExportReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-modal w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/30">
            <span className="material-symbols-outlined text-3xl text-primary">download</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mb-2">Export Report</h2>
          <p className="text-sm text-slate-400 mb-6">Select the format for the optimization results.</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-background-dark border border-primary/20 rounded-lg font-bold hover:bg-primary/10 hover:border-primary/50 transition-all text-slate-200"
            >
              <span className="material-symbols-outlined text-rose-500">picture_as_pdf</span>
              PDF Document
            </button>
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-background-dark border border-primary/20 rounded-lg font-bold hover:bg-primary/10 hover:border-primary/50 transition-all text-slate-200"
            >
              <span className="material-symbols-outlined text-emerald-500">table_view</span>
              Excel Spreadsheet
            </button>
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-background-dark border border-primary/20 rounded-lg font-bold hover:bg-primary/10 hover:border-primary/50 transition-all text-slate-200"
            >
              <span className="material-symbols-outlined text-blue-500">html</span>
              Interactive HTML
            </button>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="mt-6 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
