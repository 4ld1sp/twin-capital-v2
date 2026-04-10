import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileHeader = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateUser({ avatar: url });
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-3xl border border-[var(--border)] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
      <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 border-4 border-[var(--border)] shadow-xl transition-all group-hover:blur-[2px]" 
          title={`Click to change avatar`} 
          style={{ backgroundImage: `url("${user.avatar}")` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <div className="absolute bottom-1 right-1 bg-primary text-black w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-[var(--bg-[var(--bg-main)])] z-10 group-hover:scale-0 transition-transform">
          <span className="material-symbols-outlined text-[14px] font-bold">check</span>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleAvatarSelect} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{user.name}</h1>
        <p className="text-primary font-bold text-lg mt-1">{user.role}</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5 font-bold">Member since {user.memberSince || 'March 2018'}</p>
        
        <div className="grid grid-cols-3 gap-4 md:gap-12 mt-8">
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-primary)] font-black text-xl">$2.4M</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-black">Portfolio Value</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-primary)] font-black text-xl">14</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-black">Assets</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[var(--text-primary)] font-black text-xl">8.5%</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-black">Annual Return</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
