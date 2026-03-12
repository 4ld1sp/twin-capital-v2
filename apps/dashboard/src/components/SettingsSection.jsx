import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Laptop, Key, Monitor, Save, LogOut, User, Bell, ChevronRight, ChevronDown } from 'lucide-react';

export const AccountSettingsList = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    timezone: user.timezone || 'UTC',
    language: user.language || 'English (US)'
  });

  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      timezone: user.timezone || 'UTC',
      language: user.language || 'English (US)'
    });
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    updateUser(formData);
    setExpandedSection(null);
  };

  return (
    <div className="glass-card rounded-3xl border border-glass p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black text-main uppercase tracking-widest">Account Information</h2>
      </div>
      
      <div className="flex flex-col gap-2">
        <div 
          className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
          onClick={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Personal Information</p>
              <p className="text-secondary text-xs mt-0.5">{user.name}, {user.email}</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'personal' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
        
        {expandedSection === 'personal' && (
          <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
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
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSaveSettings} className="px-5 py-2.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                <Save className="w-4 h-4" /> Save Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SecuritySettingsList = () => {
  const { logActivity } = useAuth();
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const [trustedDevices, setTrustedDevices] = useState([
    { id: 'dev-1', type: 'laptop', name: 'MacBook Pro 16"', browser: 'Chrome', location: 'Jakarta, ID', lastActive: 'Active now', isCurrent: true },
    { id: 'dev-2', type: 'phone', name: 'iPhone 14 Pro', browser: 'Safari Mobile', location: 'Jakarta, ID', lastActive: '2 hours ago', isCurrent: false },
    { id: 'dev-3', type: 'desktop', name: 'Windows Workstation', browser: 'Edge', location: 'Singapore, SG', lastActive: '3 days ago', isCurrent: false }
  ]);

  const toggleTfa = () => {
    setTfaEnabled(!tfaEnabled);
    if (logActivity) logActivity('Security Updated', `Two-Factor Auth turned ${!tfaEnabled ? 'ON' : 'OFF'}`, 'security');
  };

  const handleLogoutDevice = (deviceId, deviceName) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    if (logActivity) logActivity('Device Removed', `Logged out from ${deviceName}`, 'security');
  };

  const toggleAccordion = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'laptop': return <Laptop className="w-5 h-5 text-primary" />;
      case 'phone': return <Smartphone className="w-5 h-5 text-primary" />;
      default: return <Monitor className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-glass p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black text-main uppercase tracking-widest">Security & Access</h2>
      </div>

      <div className="flex flex-col gap-2">
        {/* TFA */}
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

        {/* Password */}
        <div 
          className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
          onClick={() => toggleAccordion('password')}
        >
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Password Management</p>
              <p className="text-secondary text-xs mt-0.5">Update your security credentials</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'password' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {expandedSection === 'password' && (
          <div className="p-6 bg-black/5 dark:bg-white/[0.02] rounded-2xl border border-glass mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] font-black text-secondary uppercase tracking-widest">New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-glass bg-black/5 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-main outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
               </div>
               <button className="w-full py-2.5 bg-primary/20 text-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/30 transition-all">Update Password</button>
             </div>
          </div>
        )}

        {/* Devices */}
        <div 
          className="flex items-start md:items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/[0.03] rounded-2xl cursor-pointer group transition-colors"
          onClick={() => toggleAccordion('devices')}
        >
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/[0.03] flex items-center justify-center shrink-0 shadow-sm border border-glass">
              <Laptop className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-main font-bold text-sm">Trusted Devices</p>
              <p className="text-secondary text-xs mt-0.5">{trustedDevices.length} active sessions</p>
            </div>
          </div>
          <div className="shrink-0 ml-4 group-hover:text-primary text-secondary transition-colors">
            {expandedSection === 'devices' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {expandedSection === 'devices' && (
          <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {trustedDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-glass transition-all hover:border-primary/20">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <p className="text-xs font-bold text-main">{device.name}</p>
                    <p className="text-[10px] text-secondary">{device.location} • {device.lastActive}</p>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button onClick={() => handleLogoutDevice(device.id, device.name)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
