import React from 'react';

const NewStrategyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-modal w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Create New Strategy</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Strategy Name</label>
                <input 
                  className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 placeholder:text-slate-500" 
                  placeholder="e.g. Alpha Momentum" 
                  type="text" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Asset Pair</label>
                <select className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 appearance-none">
                  <option>BTC/USDT</option>
                  <option>ETH/USDT</option>
                  <option>SOL/USDT</option>
                  <option>AVAX/USDT</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Initial Capital</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input 
                  className="w-full bg-background-dark/50 border border-primary/20 rounded-lg pl-8 pr-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 placeholder:text-slate-500" 
                  placeholder="5,000" 
                  type="number" 
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Risk Level</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer">
                  <input defaultChecked className="peer sr-only" name="risk" type="radio" value="low" />
                  <div className="p-3 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 peer-checked:text-primary">Low</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="risk" type="radio" value="medium" />
                  <div className="p-3 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 peer-checked:text-primary">Medium</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="risk" type="radio" value="high" />
                  <div className="p-3 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 peer-checked:text-primary">High</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Max Drawdown Limit (%)</label>
                <input 
                  className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 placeholder:text-slate-500" 
                  placeholder="10" 
                  type="number" 
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Stop Loss (%)</label>
                <input 
                  className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 placeholder:text-slate-500" 
                  placeholder="2.5" 
                  type="number" 
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-lg font-bold text-slate-300 hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-2 w-full py-3 px-6 bg-primary text-background-dark rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark"
              >
                Launch Strategy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewStrategyModal;
