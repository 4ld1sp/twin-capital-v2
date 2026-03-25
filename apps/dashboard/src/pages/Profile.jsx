import React from 'react';
import ProfileHeader from '../components/ProfileHeader';
import RecentActivityList from '../components/RecentActivityList';
import { AccountSettingsList, SecuritySettingsList } from '../components/SettingsSection';
import DangerZone from '../components/DangerZone';

const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 w-full py-8 px-4 animate-fade-in">
      <ProfileHeader />
      <RecentActivityList />
      <AccountSettingsList />
      <SecuritySettingsList />
      <DangerZone />
    </div>
  );
};

export default Profile;
