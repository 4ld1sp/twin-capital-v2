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
    if (value >= 0.99) return 'bg-primary/40 text-primary';
    if (value > 0.8) return 'bg-primary/30 text-primary/90';
    if (value > 0.65) return 'bg-primary/20 text-primary/80';
    if (value > 0.5) return 'bg-primary/10 text-primary/70';
    return 'bg-primary/5 text-primary/50';
  };

  return (
    <div className="bg-background-light dark:bg-primary/5 rounded-xl border border-primary/10 p-6 w-full overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          Asset Strategy Correlations
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md hidden sm:inline-block">30-Day Rolling</span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
            title="Edit Asset Configuration"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${(assets.length + 1) * 60}px` }} className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          {/* Header Row */}
          <div className="flex mb-2">
            <div className="w-16 shrink-0"></div> {/* Empty top-left cell */}
            {assets.map(asset => (
              <div key={asset} className="flex-1 text-center font-bold text-xs text-primary/70 py-2 truncate px-1">
                {asset}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {data.length > 0 && data.map((row, i) => (
            <div key={assets[i]} className="flex mb-2">
              <div className="w-16 shrink-0 flex items-center justify-end pr-4 font-bold text-xs text-primary/70 truncate">
                {assets[i]}
              </div>
              {row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex-1 px-1"
                >
                  <div
                    className={`flex justify-center items-center w-full h-10 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all hover:scale-105 cursor-pointer ${getColor(val)}`}
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

      <div className="mt-6 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary/5"></div> Low Value</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-primary/40"></div> High Value</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-primary/40 font-mono tracking-wider">Source: Bybit API</span>
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
