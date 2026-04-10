import React, { useState, useEffect } from 'react';
import { useTrans } from '../context/LanguageContext';
import { Users, UserPlus, Shield, Trash2, Loader2, Crown, Eye, Pencil } from 'lucide-react';

const ROLE_ICONS = { owner: Crown, admin: Shield, member: Pencil, viewer: Eye };
const ROLE_COLORS = { owner: 'text-[var(--warning)]', admin: 'text-primary', member: 'text-[var(--text-secondary)]', viewer: 'text-[var(--text-tertiary)]' };

export default function Organization() {
  const t = useTrans();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const fetchData = async () => {
    try {
      const [orgRes, membersRes] = await Promise.all([
        fetch('/api/org').then(r => r.json()),
        fetch('/api/org/members').then(r => r.json()),
      ]);
      setOrg(orgRes.org);
      setMembers(membersRes.members || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else { setInviteEmail(''); fetchData(); }
    } catch { alert('Failed to invite'); }
    setInviting(false);
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await fetch(`/api/org/members/${memberId}`, { method: 'DELETE' });
      fetchData();
    } catch { alert('Failed to remove'); }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{t('org.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('org.subtitle')}</p>
      </div>

      {/* Org Info */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Workspace</p>
        <p className="text-lg font-semibold text-[var(--text-primary)]">{org?.name}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Plan: <span className="text-primary capitalize">{org?.plan}</span> &middot; Role: <span className="capitalize">{org?.role}</span></p>
      </div>

      {/* Members */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{t('org.members')}</h3>
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-0">
          {members.map(m => {
            const RoleIcon = ROLE_ICONS[m.role] || Eye;
            return (
              <div key={m.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                    {m.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{m.userName}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{m.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs ${ROLE_COLORS[m.role]}`}>
                    <RoleIcon className="w-3 h-3" />
                    {m.role}
                  </span>
                  {m.role !== 'owner' && org?.role === 'owner' && (
                    <button onClick={() => handleRemove(m.id)} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite */}
      {(org?.role === 'owner' || org?.role === 'admin') && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{t('org.invite')}</h3>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 h-9 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="h-9 bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2 text-sm text-[var(--text-primary)] outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail}
              className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
