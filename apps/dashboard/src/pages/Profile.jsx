import React, { useState } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import RecentActivityList from '../components/RecentActivityList';
import { AccountSettingsList, SecuritySettingsList } from '../components/SettingsSection';
import DangerZone from '../components/DangerZone';
import { useAuth } from '../context/AuthContext';
import { X, Camera, Save, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateUser(editForm);
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      <ProfileHeader onEditClick={() => {
        setEditForm({ ...user });
        setEditModalOpen(true);
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AccountSettingsList user={user} />
          <SecuritySettingsList />
          <DangerZone />
        </div>
        <div className="space-y-6">
          <RecentActivityList />
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20 shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out from Command Center
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-glass shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-glass flex justify-between items-center">
              <h3 className="text-xl font-black text-main tracking-tight">Edit Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                    <img src={editForm.avatar} alt="Edit Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Avatar URL" 
                  className="mt-4 w-full bg-slate-50 dark:bg-white/5 border border-glass rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-main font-bold"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1 block">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-main font-bold"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1 block">Professional Role</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-main font-bold"
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1 block">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 dark:bg-white/5 border border-glass rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-main font-bold opacity-70"
                    value={editForm.email}
                    disabled
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-secondary rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
