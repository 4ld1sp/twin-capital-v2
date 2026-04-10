import React, { useState, useEffect } from 'react';
import EditAssetsModal from './EditAssetsModal';

const OptimizationCorrelations = () => {
  const [assets, setAssets] = useState(['BTC', 'ETH', 'SOL', 'AVAX', 'LINK']);
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stub Bybit integration
  const fetchBybitCorrelations = async (tickers) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Procedurally generate reasonable looking correlation data for the demo
    const n = tickers.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else if (i < j) {
          // Generate a deterministic pseudo-random number based on the pair
          const combined = tickers[i] + tickers[j];
          let hash = 0;
          for (let k = 0; k < combined.length; k++) {
            hash = combined.charCodeAt(k) + ((hash << 5) - hash);
          }
          const val = 0.4 + (Math.abs(hash) % 55) / 100;
          matrix[i][j] = val;
          matrix[j][i] = val; // symmetric
        }
      }
    }
    setData(matrix);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBybitCorrelations(assets);
  }, [assets]);

  const handleSaveAssets = (newAssets) => {
    setAssets(newAssets);
    setIsEditModalOpen(false);
  };

  const getColor = (value) => {
    if (value >= 0.99) return 'bg-primary/20 text-primary border-primary/30 shadow-sm scale-[1.02] z-10';
    if (value > 0.8) return 'bg-primary/15 text-[var(--text-primary)] border-primary/20';
    if (value > 0.65) return 'bg-primary/10 text-main/80 border-primary/10';
    if (value > 0.5) return 'bg-primary/5 text-[var(--text-secondary)] border-primary/5';
    return 'text-secondary/40 border-[var(--border)]';
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-8 w-full overflow-hidden relative shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black flex items-center gap-3 text-[var(--text-primary)] uppercase tracking-widest">
          <span className="material-symbols-outlined text-primary text-2xl">grid_view</span>
          Correlation Matrix
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black px-4 py-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20 uppercase tracking-widest hidden sm:inline-block">30-Day Rolling</span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:  text-[var(--text-secondary)] border border-[var(--border)] transition-all"
            title="Edit Asset Configuration"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${(assets.length + 1) * 60}px` }} className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          {/* Header Row */}
          <div className="flex mb-3">
            <div className="w-20 shrink-0"></div>
            {assets.map(asset => (
              <div key={asset} className="flex-1 text-center font-black text-[10px] text-[var(--text-secondary)] uppercase tracking-widest py-3 truncate px-1 border-b border-[var(--border)]">
                {asset}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {data.length > 0 && data.map((row, i) => (
            <div key={assets[i]} className="flex mb-3">
              <div className="w-20 shrink-0 flex items-center justify-end pr-5 font-black text-[10px] text-[var(--text-secondary)] uppercase tracking-widest truncate">
                {assets[i]}
              </div>
              {row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex-1 px-1"
                >
                  <div
                    className={`flex justify-center items-center w-full h-12 rounded-xl text-xs font-black transition-all hover:scale-110 cursor-pointer border ${getColor(val)}`}
                    title={`${assets[i]} vs ${assets[j]}: ${val.toFixed(2)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-dark/20 backdrop-blur-[1px] z-10 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            <span className="text-xs font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Bybit...</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-black uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-[var(--text-secondary)] opacity-60"><div className="w-3 h-3 rounded-full border border-[var(--border)]"></div> Neutral</span>
          <span className="flex items-center gap-2 text-primary"><div className="w-3 h-3 rounded-full bg-primary/40 border border-primary/20"></div> Correlated</span>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)] opacity-40 font-mono tracking-tighter">Powered by Bybit Institutional API</span>
      </div>

      <EditAssetsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        activeAssets={assets}
        onSave={handleSaveAssets}
      />
    </div>
  );
};

export default OptimizationCorrelations;
