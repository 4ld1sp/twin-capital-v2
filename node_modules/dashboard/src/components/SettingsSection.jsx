import React from 'react';

const settingsItems = [
  {
    icon: "person",
    title: "Personal Information",
    description: "Alexander Twin, alex.twin@twincapital.com",
    action: "chevron_right",
    isToggle: false
  },
  {
    icon: "notifications_active",
    title: "Notification Preferences",
    description: "Email and SMS alerts are enabled",
    action: "chevron_right",
    isToggle: false
  },
  {
    icon: "payments",
    title: "Bank Accounts & Cards",
    description: "2 linked accounts for funding",
    action: "chevron_right",
    isToggle: false
  }
];

const securityItems = [
  {
    icon: "security",
    title: "Two-Factor Authentication",
    description: "Adds an extra layer of security to your account",
    isToggle: true,
    toggled: true
  },
  {
    icon: "key",
    title: "Password Management",
    description: "Last updated 45 days ago",
    actionStr: "Change",
    isButton: true
  },
  {
    icon: "devices",
    title: "Trusted Devices",
    description: "3 devices currently logged in",
    actionStr: "Manage",
    isLink: true
  }
];

export const AccountSettingsList = () => {
  return (
    <div className="bg-white dark:bg-primary/5 rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-primary/10 flex justify-between items-center">
        <h2 className="text-lg font-bold">Account Settings</h2>
        <button className="text-sm text-primary hover:underline font-medium">Edit All</button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-primary/5">
        {settingsItems.map((item, index) => (
          <div key={index} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors cursor-pointer group">
            <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 w-12 h-12">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-slate-900 dark:text-white text-base font-medium">{item.title}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{item.description}</p>
            </div>
            {item.action && <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{item.action}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SecuritySettingsList = () => {
  return (
    <div className="bg-white dark:bg-primary/5 rounded-xl border border-slate-200 dark:border-primary/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-primary/10">
        <h2 className="text-lg font-bold">Security & Access</h2>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-primary/5">
        {securityItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between px-6 py-5">
            <div className="flex gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 w-12 h-12">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white text-base font-medium">{item.title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{item.description}</p>
              </div>
            </div>
            {item.isToggle && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.toggled} />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            )}
            {item.isButton && (
              <button className="px-4 py-2 border border-slate-200 dark:border-primary/20 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">{item.actionStr}</button>
            )}
            {item.isLink && (
              <button className="text-sm font-semibold text-primary hover:underline">{item.actionStr}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
