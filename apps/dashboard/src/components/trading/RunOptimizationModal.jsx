import React from 'react';

const RunOptimizationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-modal w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">play_arrow</span>
              Run Optimization
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Target Strategy</label>
              <select className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 appearance-none">
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
                  className="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary transition-all text-slate-100 placeholder:text-slate-500" 
                  type="number" 
                  defaultValue={200}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-sm font-medium text-slate-300">Historical Data Range</label>
              <div className="grid grid-cols-4 gap-2">
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="1m" />
                  <div className="p-2 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold text-slate-400 peer-checked:text-primary">1M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="3m" defaultChecked />
                  <div className="p-2 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold text-slate-400 peer-checked:text-primary">3M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="6m" />
                  <div className="p-2 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold text-slate-400 peer-checked:text-primary">6M</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="range" type="radio" value="1y" />
                  <div className="p-2 text-center border border-primary/10 rounded-lg bg-primary/5 peer-checked:bg-primary/20 peer-checked:border-primary transition-all">
                    <p className="text-xs font-bold text-slate-400 peer-checked:text-primary">1Y</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 mt-4 border-t border-primary/10">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-lg font-bold text-slate-300 hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] w-full py-3 px-6 bg-primary text-background-dark rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
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
