import React from 'react';
import { Edit2 } from 'lucide-react';

const ProfileHeader = ({ user, onEditClick }) => {
  return (
    <div className="bg-white dark:bg-primary/5 rounded-xl border border-slate-200 dark:border-primary/10 p-8 flex flex-col md:flex-row items-center gap-8">
      <div className="relative">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 border-4 border-primary/20 shadow-xl" 
          title={`Professional headshot of ${user.name}`} 
          style={{ backgroundImage: `url("${user.avatar}")` }}
        ></div>
        <div className="absolute bottom-0 right-0 bg-primary text-background-dark w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-background-dark">
          <span className="material-symbols-outlined text-sm font-bold">verified</span>
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
            <p className="text-primary font-medium text-lg">{user.role}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Member since {user.memberSince}</p>
          </div>
          <button onClick={onEditClick} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-700 self-center md:self-start shadow-sm">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-6 pt-6 border-t border-slate-100 dark:border-primary/10">
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-bold text-xl">$2.4M</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Portfolio Value</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-bold text-xl">14</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Assets</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-bold text-xl">8.5%</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Annual Return</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
