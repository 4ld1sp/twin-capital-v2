import React from 'react';

const DangerZone = () => {
  return (
    <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-red-500 font-bold text-lg">Deactivate Account</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Once you deactivate your account, all your data will be archived.</p>
      </div>
      <button className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors w-full md:w-auto">Deactivate Account</button>
    </div>
  );
};

export default DangerZone;
