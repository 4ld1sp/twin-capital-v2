import React from 'react';

const Feed = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] w-full w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Live Market Feed</h2>
                    <p className="text-sm text-slate-500 mt-1">Real-time market intelligence and sentiment analysis.</p>
                </div>
            </div>

            <div className="flex-1 w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-primary/20 rounded-xl overflow-hidden shadow-sm relative">
                <iframe
                    src="https://glint.trade/feed"
                    title="Glint Trade Feed"
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />

                {/* Subtle loading indicator overlay while iframe loads (CSS only fallback) */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center -z-10 pointer-events-none">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-slate-500">Connecting to Glint Network...</p>
                </div>
            </div>
        </div>
    );
};

export default Feed;
