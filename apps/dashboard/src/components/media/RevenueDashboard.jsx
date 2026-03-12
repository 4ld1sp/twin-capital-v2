import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, PieChart } from 'lucide-react';

const data = [
  { month: 'Jan', revenue: 4500, referrals: 2100, sponsor: 1500 },
  { month: 'Feb', revenue: 5200, referrals: 2400, sponsor: 1800 },
  { month: 'Mar', revenue: 4800, referrals: 2200, sponsor: 2000 },
  { month: 'Apr', revenue: 6100, referrals: 2800, sponsor: 2400 },
  { month: 'May', revenue: 7500, referrals: 3500, sponsor: 2800 },
  { month: 'Jun', revenue: 8900, referrals: 4100, sponsor: 3200 },
];

const RevenueDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '$37,000', icon: DollarSign, trend: '+12.5%', color: 'text-primary' },
          { label: 'Pending Payouts', value: '$4,250', icon: CreditCard, trend: '+5.2%', color: 'text-amber-500' },
          { label: 'Projected Earnings', value: '$12,800', icon: TrendingUp, trend: '+8.1%', color: 'text-emerald-500' },
          { label: 'Conversion Rate', value: '4.8%', icon: PieChart, trend: '-0.4%', color: 'text-rose-500' },
        ].map((metric, i) => (
          <div key={i} className="glass-card rounded-3xl border border-glass p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-glass">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${metric.trend.startsWith('+') ? 'text-primary' : 'text-rose-500'}`}>
                {metric.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metric.trend}
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">{metric.label}</p>
            <p className="text-main font-black text-2xl tracking-tighter">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl border border-glass p-8 shadow-sm h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-main tracking-tight">Revenue Analytics</h3>
              <p className="text-secondary text-xs font-bold uppercase tracking-wider">Historical performance (Last 6 Months)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-main uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 800 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 800 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="glass-card rounded-3xl border border-glass p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-main tracking-tight mb-2">Source Breakdown</h3>
          <p className="text-secondary text-xs font-bold uppercase tracking-wider mb-8">Revenue by Channel</p>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {[
              { source: 'Sponsorships', amount: '$15,800', share: '42%', color: 'bg-primary' },
              { source: 'Referral Fees', amount: '$12,450', share: '34%', color: 'bg-amber-500' },
              { source: 'Adsense', amount: '$6,250', share: '17%', color: 'bg-blue-500' },
              { source: 'Direct Sales', amount: '$2,500', share: '7%', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-black text-main uppercase tracking-widest">{item.source}</span>
                  </div>
                  <span className="text-xs font-black text-main">{item.amount}</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: item.share }} />
                </div>
                <p className="text-[10px] text-secondary font-bold text-right">{item.share} contribution</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
