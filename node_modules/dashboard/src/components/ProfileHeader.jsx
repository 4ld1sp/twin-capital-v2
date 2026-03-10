import React from 'react';

const ProfileHeader = () => {
  return (
    <div className="bg-white dark:bg-primary/5 rounded-xl border border-slate-200 dark:border-primary/10 p-8 flex flex-col md:flex-row items-center gap-8">
      <div className="relative">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 border-4 border-primary/20 shadow-xl" 
          title="Professional headshot of Alexander Twin" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAyodv-C1Bztp1tlBMZMGQCk9JqKF97lX6Yw9SAP1w6MKkLGoDMdFpuFK-nlF5YzJPd57HL6J8F4uC-oL2D3116RXAPoPV9c4xSDZHtoQy3n8VoFLk8LkkqyKkfW467UWRaHUpqWDk94WODUgbWcLD8SR3H8ksle5K97Z2oz9ZFSuDQ4ijnoZuiBDaVAeH9L7F8m66XvYsxhHxYffxW8rj1qGGKkCAc9M0UTguv_xrN0mbprQMAVCnTlr2udJe6L_xO3sx2cl37s40")' }}
        ></div>
        <div className="absolute bottom-0 right-0 bg-primary text-background-dark w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-background-dark">
          <span className="material-symbols-outlined text-sm font-bold">verified</span>
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alexander Twin</h1>
        <p className="text-primary font-medium text-lg">Director of Investments</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Member since March 2018</p>
        <div className="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-slate-100 dark:border-primary/10">
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
