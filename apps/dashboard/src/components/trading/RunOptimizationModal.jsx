import React from 'react';

const RunOptimizationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-card border border-glass w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">play_arrow</span>
              Run Optimization
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-secondary hover:text-main transition-all border border-glass"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Target Strategy</label>
              <select className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-main text-xs font-bold appearance-none">
                <option>Active: BTC Momentum</option>
                <option>Active: ETH Pullback</option>
                <option>Draft: Alpha Sector</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Optimizer Algorithm</label>
              <select className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 appearance-none">
                <option>Genetic Algorithm (GA)</option>
                <option>Particle Swarm Optimization (PSO)</option>
                <option>Grid Search (Exhaustive)</option>
                <option>Random Search</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Target Metric</label>
                <select className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 appearance-none">
                  <option>Sharpe Ratio</option>
                  <option>Net Profit</option>
                  <option>Profit Factor</option>
                  <option>Low Drawdown</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Population Size</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-main text-xs font-bold placeholder:text-secondary/30" 
                  type="number" 
                  defaultValue={200}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Data Range</label>
              <div className="grid grid-cols-4 gap-2">
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="1m" />
                  <div className="p-2.5 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">1M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="3m" defaultChecked />
                  <div className="p-2.5 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">3M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="6m" />
                  <div className="p-2.5 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">6M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="1y" />
                  <div className="p-2.5 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">1Y</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 mt-4 border-t border-glass">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-glass"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] w-full py-3.5 px-6 bg-primary text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                Start Engine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RunOptimizationModal;
