import React from 'react';
import ProfileHeader from '../components/ProfileHeader';
import RecentActivityList from '../components/RecentActivityList';
import { AccountSettingsList } from '../components/SettingsSection';
import DangerZone from '../components/DangerZone';

const Profile = () => {
  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 w-full">
        <ProfileHeader />
        <RecentActivityList />
        <AccountSettingsList />
        <DangerZone />
      </div>
    </>
  );
};

export default Profile;
