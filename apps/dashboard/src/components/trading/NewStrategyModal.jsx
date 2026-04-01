import React, { useState } from 'react';
import GlassSelect from '../ui/GlassSelect';

const NewStrategyModal = ({ isOpen, onClose }) => {
  const [assetPair, setAssetPair] = useState('BTC/USDT');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dim">
      <div className="glass-card border border-glass w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black text-main uppercase tracking-widest">New Strategy</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-secondary hover:text-main transition-all border border-glass"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Strategy Name</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-main text-xs font-bold placeholder:text-secondary/30 placeholder:uppercase placeholder:tracking-widest" 
                  placeholder="e.g. Alpha Momentum" 
                  type="text" 
                  required
                />
              </div>
              <div className="space-y-2">
                <GlassSelect
                  label="Asset Pair"
                  value={assetPair}
                  onChange={setAssetPair}
                  options={['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT']}
                  searchable={true}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Initial Capital</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-40 text-xs font-black">$</span>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl pl-10 pr-5 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-main text-xs font-bold placeholder:text-secondary/30" 
                  placeholder="5,000" 
                  type="number" 
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Risk Level</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="cursor-pointer">
                  <input defaultChecked className="peer sr-only" name="risk" type="radio" value="low" />
                  <div className="p-3 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">Low</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="risk" type="radio" value="medium" />
                  <div className="p-3 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">Medium</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="risk" type="radio" value="high" />
                  <div className="p-3 text-center border border-glass rounded-xl bg-black/5 dark:bg-white/5 peer-checked:bg-primary peer-checked:border-primary peer-checked:text-black transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest">High</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Max Drawdown Limit (%)</label>
                <input 
                  className="w-full bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-5 py-3 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-main text-xs font-bold placeholder:text-secondary/30" 
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

            <div className="flex items-center gap-4 pt-6 mt-2 border-t border-glass">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-glass"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] w-full py-3.5 px-6 bg-primary text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
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
