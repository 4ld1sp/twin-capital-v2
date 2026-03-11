import React, { useState } from 'react';
import { X, Save, Camera } from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import RecentActivityList from '../components/RecentActivityList';
import { AccountSettingsList, SecuritySettingsList } from '../components/SettingsSection';
import DangerZone from '../components/DangerZone';

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: 'Alexander Twin',
    role: 'Director of Investments',
    email: 'alex.twin@twincapital.com',
    memberSince: 'March 2018',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyodv-C1Bztp1tlBMZMGQCk9JqKF97lX6Yw9SAP1w6MKkLGoDMdFpuFK-nlF5YzJPd57HL6J8F4uC-oL2D3116RXAPoPV9c4xSDZHtoQy3n8VoFLk8LkkqyKkfW467UWRaHUpqWDk94WODUgbWcLD8SR3H8ksle5K97Z2oz9ZFSuDQ4ijnoZuiBDaVAeH9L7F8m66XvYsxhHxYffxW8rj1qGGKkCAc9M0UTguv_xrN0mbprQMAVCnTlr2udJe6L_xO3sx2cl37s40'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });

  const handleSaveProfile = () => {
    setUserProfile(editForm);
    setIsEditingProfile(false);
  };

  const renderEditModal = () => {
    if (!isEditingProfile) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Profile</h3>
            <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div 
                  className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-primary/20"
                  style={{ backgroundImage: `url("${editForm.avatar}")` }}
                ></div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <input 
                type="text"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Professional Role</label>
              <input 
                type="text"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={editForm.role}
                onChange={e => setEditForm({...editForm, role: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={editForm.email}
                onChange={e => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Avatar URL</label>
              <input 
                type="text"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={editForm.avatar}
                onChange={e => setEditForm({...editForm, avatar: e.target.value})}
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
             <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
               Cancel
             </button>
             <button onClick={handleSaveProfile} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2">
               <Save className="w-4 h-4" /> Save Changes
             </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 w-full">
        <ProfileHeader user={userProfile} onEditClick={() => {
          setEditForm({ ...userProfile });
          setIsEditingProfile(true);
        }} />
        <RecentActivityList />
        <AccountSettingsList user={userProfile} />
        <SecuritySettingsList />
        <DangerZone />
      </div>

      {renderEditModal()}
    </>
  );
};

export default Profile;
