// ========================================
// TWIN CAPITAL — Mock Data
// ========================================

// ---- Executive Dashboard ----
export const kpiData = {
  netWorth: { value: 124500, delta: 3.2, trend: [98, 102, 100, 108, 112, 118, 124.5] },
  tradingPnl: { value: 8.1, delta: 1.4, trend: [2.1, 3.5, 4.2, 5.8, 6.6, 7.2, 8.1] },
  mediaRevenue: { value: 3250, delta: 12.5, trend: [1800, 2100, 2400, 2600, 2800, 3100, 3250] },
  drawdown: { value: 7.2, limit: 15, delta: -2.1, trend: [12, 10, 8.5, 9.2, 8, 7.8, 7.2] },
};

// ---- Portfolio Performance (30 days) ----
export const portfolioPerformance = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  const base = 100000 + i * 800 + Math.random() * 2000 - 500;
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.round(base),
    benchmark: Math.round(100000 + i * 400 + Math.random() * 800),
  };
});

// ---- Capital Allocation ----
export const capitalAllocation = [
  { name: 'BTC Momentum', value: 40, color: '#f59e0b' },
  { name: 'ETH Pullback', value: 30, color: '#8b5cf6' },
  { name: 'Marketing', value: 30, color: '#00b4d8' },
];

// ---- Bot Status ----
export const bots = [
  { id: 1, name: 'BTC Momentum Bot', status: 'live', pnl: 4.2, trades: 48, winrate: 72 },
  { id: 2, name: 'ETH Pullback Bot', status: 'standby', pnl: 1.8, trades: 22, winrate: 64 },
  { id: 3, name: 'Grid Trading Bot', status: 'live', pnl: 2.1, trades: 156, winrate: 68 },
  { id: 4, name: 'Risk Manager Bot', status: 'live', pnl: null, trades: null, winrate: null, drawdown: 3.4 },
];

// ---- Trading KPIs ----
export const tradingKpis = {
  totalPnl: { value: 8.1, label: 'Total PnL %' },
  winrate: { value: 68, label: 'Winrate %' },
  sharpe: { value: 1.42, label: 'Sharpe Ratio' },
  maxDrawdown: { value: -7.2, label: 'Max Drawdown %' },
};

// ---- PnL History ----
export const pnlHistory = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    daily: +(Math.random() * 2 - 0.5).toFixed(2),
    cumulative: +(2 + i * 0.2 + Math.random() * 0.5).toFixed(2),
  };
});

// ---- Drawdown History ----
export const drawdownHistory = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  const dd = Math.max(0, 12 - i * 0.15 + Math.sin(i * 0.5) * 2);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: +dd.toFixed(1),
    limit: 15,
  };
});

// ---- Operational Activity Log ----
export const activityLog = [
  { id: 1, type: 'teal', icon: '✓', title: 'Rebalancing Complete', desc: 'Portfolio rebalanced per Q1 strategy targets', time: '2 min ago' },
  { id: 2, type: 'amber', icon: '⚠', title: 'ETH Bot Standby', desc: 'Pullback conditions not met, bot paused', time: '15 min ago' },
  { id: 3, type: 'teal', icon: '↑', title: 'BTC Bot Trade Closed', desc: 'Long BTC @ $67,420 → $68,100 (+1.01%)', time: '32 min ago' },
  { id: 4, type: 'purple', icon: '📊', title: 'Weekly Report Generated', desc: 'Trading performance summary for W10 2026', time: '1 hour ago' },
  { id: 5, type: 'teal', icon: '✓', title: 'Grid Bot Cycle', desc: 'Completed 3 grid trades, net +0.34%', time: '2 hours ago' },
  { id: 6, type: 'red', icon: '!', title: 'Drawdown Alert', desc: 'Drawdown reached 7.2% (limit: 15%)', time: '3 hours ago' },
  { id: 7, type: 'purple', icon: '📱', title: 'Content Published', desc: 'TikTok video scheduled and posted successfully', time: '4 hours ago' },
];

// ---- Content Pipeline (Kanban) ----
export const contentPipeline = {
  generated: [
    { id: 1, title: 'Top 5 Crypto Tips for Beginners', platform: 'X', format: 'Thread' },
    { id: 2, title: 'Baby Product Review: Stroller X', platform: 'Instagram', format: 'Carousel' },
  ],
  repurposed: [
    { id: 3, title: 'Market Outlook Q1 2026', platform: 'TikTok', format: 'Short Video' },
  ],
  scheduled: [
    { id: 4, title: 'ETH Analysis Deep Dive', platform: 'YouTube', format: 'Long Video' },
    { id: 5, title: 'Affiliate: Best Baby Monitors', platform: 'Instagram', format: 'Reel' },
  ],
  published: [
    { id: 6, title: 'BTC Weekly Recap', platform: 'X', format: 'Thread', engagement: 2.4 },
    { id: 7, title: 'Mommy Hack: Safety Tips', platform: 'TikTok', format: 'Short Video', engagement: 5.1 },
    { id: 8, title: 'Grid Trading Explained', platform: 'YouTube', format: 'Long Video', engagement: 3.8 },
  ],
};

// ---- Followers Growth ----
export const followersGrowth = Array.from({ length: 12 }, (_, i) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    month: months[i],
    x: 1200 + i * 180 + Math.floor(Math.random() * 100),
    instagram: 800 + i * 250 + Math.floor(Math.random() * 150),
    tiktok: 500 + i * 400 + Math.floor(Math.random() * 200),
    youtube: 300 + i * 120 + Math.floor(Math.random() * 80),
  };
});

// ---- Engagement Rate ----
export const engagementData = [
  { platform: 'X', rate: 2.4, posts: 120 },
  { platform: 'Instagram', rate: 4.8, posts: 85 },
  { platform: 'TikTok', rate: 7.2, posts: 64 },
  { platform: 'YouTube', rate: 3.6, posts: 24 },
];

// ---- Affiliate Conversion ----
export const affiliateData = [
  { stage: 'Impressions', value: 45000, color: '#00b4d8' },
  { stage: 'Clicks', value: 3200, color: '#00d4aa' },
  { stage: 'Sign-ups', value: 480, color: '#8b5cf6' },
  { stage: 'Purchases', value: 96, color: '#f59e0b' },
];

// ---- Revenue per Post ----
export const revenuePerPost = [
  { type: 'YouTube Long', revenue: 85, count: 12 },
  { type: 'TikTok Short', revenue: 32, count: 48 },
  { type: 'IG Carousel', revenue: 28, count: 35 },
  { type: 'X Thread', revenue: 15, count: 65 },
  { type: 'IG Reel', revenue: 42, count: 28 },
];

// ---- Backtest Results ----
export const backtestResults = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 89 + i);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    strategy: +(100 + i * 0.8 + Math.sin(i * 0.3) * 4 + Math.random() * 2).toFixed(1),
    benchmark: +(100 + i * 0.3 + Math.sin(i * 0.2) * 2).toFixed(1),
  };
});

// ---- Market Regime ----
export const marketRegime = {
  current: 'Bullish Volatile',
  confidence: 78,
  indicators: {
    trend: 'Bullish',
    volatility: 'High',
    volume: 'Above Average',
    sentiment: 'Greedy',
  },
};

// ---- A/B Testing ----
export const abTests = [
  { id: 1, name: 'Video Hook Style', variantA: 'Question Hook', variantB: 'Stat Hook', ctrA: 12.4, ctrB: 8.1, winner: 'A', status: 'completed' },
  { id: 2, name: 'Post Format', variantA: 'Carousel', variantB: 'Single Image', ctrA: 6.2, ctrB: 4.8, winner: 'A', status: 'completed' },
  { id: 3, name: 'CTA Placement', variantA: 'End', variantB: 'Middle', ctrA: 3.1, ctrB: 4.5, winner: 'B', status: 'running' },
];

// ---- Settings defaults ----
export const defaultSettings = {
  allocation: { btc: 40, eth: 30, marketing: 30 },
  risk: { maxDrawdown: 15, stopLoss: 10, rebalanceFreq: 'weekly' },
  notifications: {
    drawdownAlert: true,
    rebalancingComplete: true,
    targetAchieved: true,
    dailySummary: false,
    botStatusChanges: false,
  },
};
