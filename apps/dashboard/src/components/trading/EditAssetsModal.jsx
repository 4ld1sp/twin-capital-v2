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
                <div className="w-full max-w-md bg-background-dark/95 border border-primary/20 rounded-2xl shadow-2xl glass-modal pointer-events-auto transform transition-all">

                    <div className="flex justify-between items-center p-5 border-b border-primary/10">
                        <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit_square</span>
                            Edit Assets
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-slate-400 mb-6 font-medium">
                            Add or remove tickers to dynamically re-calculate correlations. Data will be fetched from Bybit analytics endpoint.
                        </p>

                        {/* Add Asset Form */}
                        <form onSubmit={handleAddAsset} className="mb-6 flex gap-2">
                            <input
                                type="text"
                                value={newAsset}
                                onChange={(e) => setNewAsset(e.target.value)}
                                placeholder="e.g. XRP, DOGE"
                                className="flex-1 bg-background-dark border border-primary/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-all"
                                maxLength={10}
                            />
                            <button
                                type="submit"
                                disabled={!newAsset.trim() || assets.length >= 8}
                                className="bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center"
                            >
                                Add
                            </button>
                        </form>

                        {/* Active Assets List */}
                        <div className="space-y-2 mb-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                                <span>Active Tickers ({assets.length}/8)</span>
                                {assets.length <= 2 && <span className="text-rose-400">Min 2 required</span>}
                            </div>

                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                {assets.map((asset) => (
                                    <div key={asset} className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-white px-3 py-1.5 rounded-lg select-none">
                                        <span className="font-mono font-bold">{asset}</span>
                                        <button
                                            onClick={() => handleRemoveAsset(asset)}
                                            disabled={assets.length <= 2}
                                            className="text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="flex gap-3 p-5 border-t border-primary/10 bg-black/20 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-slate-300 font-bold hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-background-dark font-black hover:opacity-90 transition-opacity"
                        >
                            Save Configuration
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default EditAssetsModal;
