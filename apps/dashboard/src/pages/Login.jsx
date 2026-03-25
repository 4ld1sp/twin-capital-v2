import React from 'react';

export default function Login({ onLogin }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center gradient-bg overflow-hidden px-4">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      
      <div className="layout-container flex w-full max-w-[1200px] flex-col z-10 relative">
        {/* Header / Logo */}
        <header className="flex items-center justify-between px-6 py-8 w-full max-w-[480px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Twin Capital</h2>
          </div>
          <div className="text-primary flex items-center">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
        </header>

        {/* Login Card */}
        <main className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="glass-card w-full max-w-[480px] rounded-xl p-8 shadow-2xl relative">
            <div className="mb-8 items-center text-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">Welcome to Command Center</h1>
              <p className="text-slate-600 dark:text-slate-400 text-base">Secure access to your capital management dashboard</p>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if(onLogin) onLogin(); }}>
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold uppercase tracking-wider">Corporate Email</label>
                <div className="relative">
                  <input className="w-full h-14 bg-black/5 dark:bg-black/40 border border-slate-300 dark:border-slate-700/50 rounded-lg px-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="name@twincapital.com" type="email" required />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 flex items-center">
                    <span className="material-symbols-outlined">alternate_email</span>
                  </div>
                </div>
              </div>
              
              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <label className="text-slate-700 dark:text-slate-200 text-sm font-semibold uppercase tracking-wider">Password</label>
                  <a className="text-primary text-xs font-medium hover:underline" href="#">Forgot?</a>
                </div>
                <div className="relative">
                  <input className="w-full h-14 bg-black/5 dark:bg-black/40 border border-slate-300 dark:border-slate-700/50 rounded-lg px-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="••••••••••••" type="password" required />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors flex items-center" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <input className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-background-dark text-primary focus:ring-primary focus:ring-offset-2 outline-none" id="remember" type="checkbox" />
                <label className="text-slate-600 dark:text-slate-300 text-sm select-none cursor-pointer" htmlFor="remember">Remember this device for 30 days</label>
              </div>
              
              {/* Submit Button */}
              <button type="submit" className="group w-full h-14 bg-primary text-background-dark font-bold text-base rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                ACCESS COMMAND CENTER
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/30 flex flex-col items-center gap-4">
              <p className="text-slate-600 dark:text-slate-500 text-xs text-center uppercase tracking-[0.2em]">Authorized Personnel Only</p>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50 grayscale hover:grayscale-0 transition-all cursor-pointer" title="SSO Login">
                  <span className="material-symbols-outlined text-slate-300">key</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/50 grayscale hover:grayscale-0 transition-all cursor-pointer" title="Hardware Token">
                  <span className="material-symbols-outlined text-slate-300">token</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          <footer className="mt-8 flex gap-6 text-slate-500 text-xs font-medium uppercase tracking-widest relative z-10">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <span className="opacity-30">•</span>
            <a className="hover:text-primary transition-colors" href="#">Security Protocol</a>
            <span className="opacity-30">•</span>
            <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
          </footer>
        </main>
      </div>

      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-50"></div>
    </div>
  );
}
