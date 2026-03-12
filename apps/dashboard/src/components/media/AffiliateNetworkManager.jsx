import React, { useState } from 'react';
import { ExternalLink, Plus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const AffiliateNetworkManager = () => {
  const [networks, setNetworks] = useState([
    { id: 1, name: 'Bybit Partner Network', type: 'Exchange Partner', status: 'Active', revenue: '$12,450', link: 'https://partner.bybit.com' },
    { id: 2, name: 'Binance Affiliate', type: 'Exchange Partner', status: 'Active', revenue: '$8,200', link: 'https://binance.com' },
    { id: 3, name: 'Amazon Associates', type: 'E-commerce', status: 'Pending', revenue: '$0', link: 'https://affiliate-program.amazon.com' }
  ]);

  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-main tracking-tight">Affiliate Network Management</h3>
          <p className="text-secondary text-sm font-bold">Manage and monitor your partner API connections</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Network
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networks.map((network) => (
          <div key={network.id} className="glass-card rounded-3xl border border-glass p-6 hover:border-primary/30 transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${network.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'} border border-glass`}>
                <span className="material-symbols-outlined">{network.type === 'Exchange Partner' ? 'handshake' : 'shopping_cart'}</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <a href={network.link} target="_blank" rel="noopener noreferrer" className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h4 className="text-main font-black text-lg tracking-tight">{network.name}</h4>
              <p className="text-secondary text-xs font-bold uppercase tracking-wider">{network.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Total Revenue</p>
                <p className="text-main font-black text-lg">{network.revenue}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  {network.status === 'Active' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span className={`text-xs font-bold ${network.status === 'Active' ? 'text-primary' : 'text-amber-500'}`}>
                    {network.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-glass shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-glass flex justify-between items-center">
              <h3 className="text-xl font-black text-main tracking-tight">Connect New Network</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <Plus className="w-5 h-5 text-secondary rotate-45" />
              </button>
            </div>
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">api</span>
              </div>
              <p className="text-main font-bold">API Integration in Progress</p>
              <p className="text-secondary text-xs font-medium">To connect a new affiliate network, please reach out to the developer team to verify the partner's API documentation.</p>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-full mt-6 px-4 py-3 bg-slate-100 dark:bg-white/5 text-main rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-glass"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateNetworkManager;
