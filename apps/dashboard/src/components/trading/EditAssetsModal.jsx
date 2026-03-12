import React, { useState, useEffect } from 'react';

const EditAssetsModal = ({ isOpen, onClose, activeAssets, onSave }) => {
    const [assets, setAssets] = useState([]);
    const [newAsset, setNewAsset] = useState('');

    // Sync internal state when modal opens
    useEffect(() => {
        if (isOpen) {
            setAssets([...activeAssets]);
            setNewAsset('');
        }
    }, [isOpen, activeAssets]);

    if (!isOpen) return null;

    const handleAddAsset = (e) => {
        e.preventDefault();
        const ticker = newAsset.trim().toUpperCase();
        if (ticker && !assets.includes(ticker) && assets.length < 8) {
            setAssets([...assets, ticker]);
            setNewAsset('');
        }
    };

    const handleRemoveAsset = (tickerToRemove) => {
        if (assets.length > 2) { // Enforce minimum 2 assets for a meaningful matrix
            setAssets(assets.filter(a => a !== tickerToRemove));
        }
    };

    const handleSave = () => {
        onSave(assets);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-dim transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 pointer-events-none">
                <div className="w-full max-w-md glass-card border border-glass rounded-3xl shadow-2xl pointer-events-auto transform transition-all">

                    <div className="flex justify-between items-center px-8 py-6 border-b border-glass">
                        <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">edit_square</span>
                            Asset Config
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-secondary hover:text-main transition-all border border-glass"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    <div className="px-8 py-6">
                        <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-6 opacity-60">
                            Add or remove tickers. Correlations re-fetch via Bybit API.
                        </p>

                        {/* Add Asset Form */}
                        <form onSubmit={handleAddAsset} className="mb-6 flex gap-3">
                            <input
                                type="text"
                                value={newAsset}
                                onChange={(e) => setNewAsset(e.target.value)}
                                placeholder="e.g. XRP"
                                className="flex-1 bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-5 py-3 text-main placeholder:text-secondary/30 placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 uppercase text-xs font-black tracking-widest transition-all"
                                maxLength={10}
                            />
                            <button
                                type="submit"
                                disabled={!newAsset.trim() || assets.length >= 8}
                                className="bg-primary text-black hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                            >
                                Add
                            </button>
                        </form>

                        {/* Active Assets List */}
                        <div className="space-y-2 mb-2">
                            <div className="flex justify-between text-[10px] font-black text-secondary mb-3 uppercase tracking-widest">
                                <span>Active ({assets.length}/8)</span>
                                {assets.length <= 2 && <span className="text-rose-500">Min 2</span>}
                            </div>

                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                {assets.map((asset) => (
                                    <div key={asset} className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-main px-4 py-2 rounded-xl select-none">
                                        <span className="font-black text-xs uppercase tracking-widest">{asset}</span>
                                        <button
                                            onClick={() => handleRemoveAsset(asset)}
                                            disabled={assets.length <= 2}
                                            className="text-secondary hover:text-rose-500 disabled:opacity-30 disabled:hover:text-secondary transition-colors flex items-center"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="flex gap-3 px-8 py-6 border-t border-glass">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl text-secondary font-black text-[11px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-glass"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-2xl bg-primary text-black font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                        >
                            Save
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default EditAssetsModal;
