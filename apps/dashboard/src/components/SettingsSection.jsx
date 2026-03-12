import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Laptop, Key, Monitor, Save, LogOut, User, Bell, ChevronRight, ChevronDown } from 'lucide-react';

export const AccountSettingsList = () => {
  const { user, updateUser, logActivity } = useAuth();
  
  // Local form state
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    timezone: user.timezone || 'UTC',
    language: user.language || 'English (US)'
  });

  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  // Mock Trusted Devices
  const [trustedDevices, setTrustedDevices] = useState([
    { id: 'dev-1', type: 'laptop', name: 'MacBook Pro 16"', browser: 'Chrome', location: 'Jakarta, ID', lastActive: 'Active now', isCurrent: true },
    { id: 'dev-2', type: 'phone', name: 'iPhone 14 Pro', browser: 'Safari Mobile', location: 'Jakarta, ID', lastActive: '2 hours ago', isCurrent: false },
    { id: 'dev-3', type: 'desktop', name: 'Windows Workstation', browser: 'Edge', location: 'Singapore, SG', lastActive: '3 days ago', isCurrent: false }
  ]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    updateUser(formData);
    setExpandedSection(null);
  };

  const toggleTfa = () => {
    setTfaEnabled(!tfaEnabled);
    logActivity('Security Updated', `Two-Factor Auth turned ${!tfaEnabled ? 'ON' : 'OFF'}`, 'security');
  };

  const handleLogoutDevice = (deviceId, deviceName) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    logActivity('Device Removed', `Logged out from ${deviceName}`, 'security');
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'laptop': return <Laptop className="w-5 h-5 text-primary" />;
      case 'phone': return <Smartphone className="w-5 h-5 text-primary" />;
      default: return <Monitor className="w-5 h-5 text-primary" />;
    }
  };

  const toggleAccordion = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="glass-card rounded-3xl border border-glass p-6 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black text-main uppercase tracking-widest">Account & Security</h2>
      </div>
      
      <div className="flex flex-col gap-2">
        
        {/* SECTION 1: Personal Information */}
        <div className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors" onClick={() => toggleAccordion('personal')}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">{expandedSection === 'personal' ? 'Edit Personal Information' : 'Personal Information'}</p>
              <p className="text-secondary text-xs mt-0.5">{user.name}, {user.email}</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'personal' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
        
        {expandedSection === 'personal' && (
          <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Language</label>
                <select name="language" value={formData.language} onChange={handleInputChange} className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                  <option>English (US)</option>
                  <option>Indonesian (ID)</option>
                  <option>Spanish (ES)</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Timezone</label>
                <select name="timezone" value={formData.timezone} onChange={handleInputChange} className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all">
                  <option>UTC - Coordinated Universal Time</option>
                  <option>UTC+7 - Western Indonesia Time</option>
                  <option>UTC-5 - Eastern Time</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} className="px-5 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" /> Save Details
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: Notification Preferences */}
        <div className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors" onClick={() => toggleAccordion('notifications')}>
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Notification Preferences</p>
              <p className="text-secondary text-xs mt-0.5">Email and SMS alerts are enabled</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'notifications' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {expandedSection === 'notifications' && (
           <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2">
            <p className="text-secondary text-xs font-bold">Notification toggles will be implemented in future upgrades.</p>
           </div>
        )}

        {/* SECTION 3: Two-Factor Authentication (Toggle, no accordion) */}
        <div className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl transition-colors">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Two-Factor Authentication</p>
              <p className="text-secondary text-xs mt-0.5">Adds an extra layer of security</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input type="checkbox" className="sr-only peer" checked={tfaEnabled} onChange={toggleTfa} />
            <div className="w-11 h-6 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* SECTION 4: Password Management */}
        <div className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors" onClick={() => toggleAccordion('password')}>
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Password Management</p>
              <p className="text-secondary text-xs mt-0.5">Last updated 45 days ago</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'password' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {expandedSection === 'password' && (
          <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
             </div>
             <div className="mt-6 flex justify-end">
                <button onClick={() => setExpandedSection(null)} className="px-5 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                  <Key className="w-4 h-4" /> Update Password
                </button>
              </div>
          </div>
        )}

        {/* SECTION 5: Trusted Devices */}
        <div className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors" onClick={() => toggleAccordion('devices')}>
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Laptop className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Trusted Devices</p>
              <p className="text-secondary text-xs mt-0.5">{trustedDevices.length} devices currently logged in</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'devices' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {expandedSection === 'devices' && (
          <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2">
            <p className="text-xs text-secondary font-bold mb-6">Remove devices you don't recognize.</p>
            
            <div className="space-y-4">
              {trustedDevices.length === 0 ? (
                <div className="text-center py-6 text-xs text-secondary border border-dashed border-glass rounded-xl">No active devices found.</div>
              ) : (
                trustedDevices.map((device) => (
                  <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-glass hover:border-primary/20 transition-colors gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="p-3 bg-black/5 dark:bg-white/[0.03] rounded-xl border border-glass">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-main font-black text-sm">{device.name}</p>
                          {device.isCurrent && (
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-primary text-black uppercase tracking-widest">Current</span>
                          )}
                        </div>
                        <p className="text-secondary text-xs mt-0.5 font-bold">{device.browser} • {device.location}</p>
                        <p className="text-secondary text-[10px] mt-1 opacity-60">Last active: {device.lastActive}</p>
                      </div>
                    </div>
                    
                    {!device.isCurrent && (
                      <button 
                        onClick={() => handleLogoutDevice(device.id, device.name)}
                        className="group flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20 self-start sm:self-center"
                      >
                        <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                        Log out
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

