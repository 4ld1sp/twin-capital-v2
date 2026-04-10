import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrans } from '../context/LanguageContext';
import {
  Bot, Send, MessageSquare, Database, BrainCircuit, AppWindow,
  Mail, ShoppingBag, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';

const serviceConfig = [
  { key: 'tradingBot', icon: Bot, accent: 'var(--success)', status: 'active', link: '/trading', metrics: '3 exchanges' },
  { key: 'socialAgent', icon: Send, accent: 'var(--info)', status: 'active', link: '/media', metrics: '8 platforms' },
  { key: 'csAgent', icon: MessageSquare, accent: '#818CF8', status: 'coming_soon' },
  { key: 'dataIntel', icon: Database, accent: 'var(--warning)', status: 'coming_soon' },
  { key: 'consultant', icon: BrainCircuit, accent: '#22D3EE', status: 'coming_soon' },
  { key: 'webappBuilder', icon: AppWindow, accent: '#F472B6', status: 'coming_soon' },
  { key: 'emailMarketing', icon: Mail, accent: '#FB923C', status: 'coming_soon' },
  { key: 'marketplace', icon: ShoppingBag, accent: '#A78BFA', status: 'coming_soon' },
];

export default function Services() {
  const t = useTrans();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{t('services.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('services.subtitle')}</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-[var(--success)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-medium">2</span> {t('services.active')}
        </span>
        <span className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">6</span> {t('services.coming_soon')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {serviceConfig.map(service => (
          <ServiceCard key={service.key} service={service} t={t} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, t, navigate }) {
  const Icon = service.icon;
  const isActive = service.status === 'active';

  return (
    <div className={`bg-[var(--bg-surface)] border rounded-xl p-5 transition-colors ${
      isActive ? 'border-[var(--border)] hover:border-[var(--border-hover)]' : 'border-[var(--border)] opacity-70'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${service.accent}15` }}>
            <Icon className="w-4.5 h-4.5" style={{ color: service.accent }} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">{t(`services.${service.key}`)}</h3>
            {isActive && <span className="text-[11px] text-[var(--text-tertiary)]">{service.metrics}</span>}
          </div>
        </div>
        {isActive ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--success)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse-dot" />
            {t('services.active')}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{t('services.coming_soon')}</span>
        )}
      </div>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{t(`services.${service.key}Desc`)}</p>

      {isActive ? (
        <button
          onClick={() => navigate(service.link)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {t('services.configure')} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
          <Clock className="w-3.5 h-3.5" /> {t('services.coming_soon')}
        </span>
      )}
    </div>
  );
}
