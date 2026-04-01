import { pgTable, text, timestamp, boolean, integer, real, jsonb } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════════════════════════
// BETTER AUTH — Core Tables (managed by Better Auth, do not rename)
// ═══════════════════════════════════════════════════════════════

export const user = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('role').default('user'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const account = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Better Auth 2FA table
export const twoFactor = pgTable('two_factors', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


// ═══════════════════════════════════════════════════════════════
// APPLICATION — Custom Tables
// ═══════════════════════════════════════════════════════════════

/**
 * Encrypted API Keys
 * `encryptedFields` stores a JSON blob encrypted with AES-256-GCM.
 * The raw keys are NEVER sent to the client — only masked values.
 */
export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  platformId: text('platform_id').notNull(),         // e.g., 'binance', 'bybit', 'openai'
  category: text('category').notNull(),               // 'trading' | 'social' | 'ai' | 'webhooks'
  name: text('name').notNull(),                       // Display name (e.g., 'Binance Main')
  encryptedFields: text('encrypted_fields').notNull(), // AES-256-GCM encrypted JSON
  isConnected: boolean('is_connected').default(false),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Crypto Portfolio Holdings (Spot assets)
 */
export const assetsCrypto = pgTable('assets_crypto', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),                   // e.g., 'BTCUSDT'
  quantity: real('quantity').notNull(),
  entryPrice: real('entry_price').notNull(),
  exchange: text('exchange').default('binance'),       // source exchange
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Indonesia Stock (IDX) Portfolio Holdings
 */
export const assetsSaham = pgTable('assets_saham', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  ticker: text('ticker').notNull(),                   // e.g., 'BBCA'
  name: text('name').notNull(),                       // e.g., 'Bank Central Asia'
  lots: integer('lots').notNull(),
  entryPrice: real('entry_price').notNull(),
  color: text('color').default('indigo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Content Pipeline Items (Kanban board)
 */
export const contentItems = pgTable('content_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body'),
  platform: text('platform'),                         // 'X', 'Instagram', 'TikTok', etc.
  format: text('format'),                             // 'Thread', 'Carousel', 'Short Video', etc.
  status: text('status').notNull().default('backlog'), // 'backlog' | 'in_progress' | 'review' | 'go_live'
  targetTime: timestamp('target_time'),
  mediaUrls: jsonb('media_urls').default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Activity / Audit Logs
 */
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  details: text('details'),
  type: text('type').notNull().default('system'),      // 'system' | 'security' | 'update' | 'login' | 'error'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


// ═══════════════════════════════════════════════════════════════
// PHASE 5 — Auto-Trading Engine
// ═══════════════════════════════════════════════════════════════

/**
 * Deployed Bots
 * Each record represents a running (or stopped) trading bot instance.
 * The engine uses TWO independent loops per bot:
 *   1. Signal Engine (AI) — runs every `signalInterval` (e.g. '30m')
 *   2. Risk Engine (hardcoded) — runs every `riskInterval` (e.g. '10s')
 */
export const deployedBots = pgTable('deployed_bots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  // ─── Strategy Definition ───
  strategyName: text('strategy_name').notNull(),
  strategyScript: text('strategy_script').notNull(),       // Pine Script / Python code
  strategyPrompt: text('strategy_prompt'),                 // Original AI prompt used to generate

  // ─── Market Config ───
  symbol: text('symbol').notNull().default('BTCUSDT'),
  exchange: text('exchange').notNull().default('bybit'),
  networkMode: text('network_mode').notNull().default('testnet'), // 'testnet' | 'mainnet'

  // ─── Dual-Loop Intervals ───
  signalInterval: text('signal_interval').notNull().default('30m'),  // AI check frequency
  riskInterval: text('risk_interval').notNull().default('10s'),      // Risk check frequency

  // ─── Risk Management Config ───
  leverage: integer('leverage').notNull().default(5),
  leverageType: text('leverage_type').notNull().default('isolated'),  // 'isolated' | 'cross'
  maxDailyLossPct: real('max_daily_loss_pct').notNull().default(5),   // % of equity
  maxPositions: integer('max_positions').notNull().default(1),
  maxTradesPerDay: integer('max_trades_per_day').notNull().default(3),
  riskPerTradePct: real('risk_per_trade_pct').notNull().default(1),   // % of equity per trade

  // ─── Dynamic Trailing Stop Config ───
  trailingStopActivationPct: real('trailing_stop_activation_pct').notNull().default(1.0),  // % profit to activate
  trailingStopCallbackPct: real('trailing_stop_callback_pct').notNull().default(0.5),      // % pullback to close

  // ─── Runtime State ───
  status: text('status').notNull().default('stopped'),  // 'running' | 'paused' | 'stopped' | 'error' | 'killed'
  lastSignalAt: timestamp('last_signal_at'),             // Last AI signal check
  lastRiskCheckAt: timestamp('last_risk_check_at'),      // Last risk engine tick
  lastSignalAction: text('last_signal_action'),          // 'BUY' | 'SELL' | 'HOLD'

  // ─── Accumulated Stats ───
  totalPnl: real('total_pnl').notNull().default(0),
  totalTrades: integer('total_trades').notNull().default(0),
  winCount: integer('win_count').notNull().default(0),
  lossCount: integer('loss_count').notNull().default(0),
  dailyPnl: real('daily_pnl').notNull().default(0),       // Reset at 00:00 UTC
  dailyTradeCount: integer('daily_trade_count').notNull().default(0),

  // ─── Lifecycle ───
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  stoppedAt: timestamp('stopped_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Trade Logs
 * Every AI decision and trade execution is recorded here.
 * Immutable audit trail — rows are NEVER updated or deleted.
 */
export const tradeLogs = pgTable('trade_logs', {
  id: text('id').primaryKey(),
  botId: text('bot_id').notNull().references(() => deployedBots.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  // ─── Decision ───
  action: text('action').notNull(),          // 'BUY' | 'SELL' | 'HOLD' | 'CLOSE' | 'TRAILING_STOP' | 'KILL_SWITCH' | 'ERROR'
  source: text('source').notNull(),          // 'signal_engine' | 'risk_engine'

  // ─── Order Details ───
  symbol: text('symbol'),
  side: text('side'),                        // 'Buy' | 'Sell'
  orderType: text('order_type'),             // 'Market' | 'Limit'
  qty: text('qty'),
  price: text('price'),                      // Execution price
  takeProfit: text('take_profit'),
  stopLoss: text('stop_loss'),
  trailingStop: text('trailing_stop'),       // Dynamic trailing stop value

  // ─── Bybit Response ───
  orderId: text('order_id'),                 // Bybit order ID
  orderStatus: text('order_status'),         // 'filled' | 'rejected' | 'pending' | 'cancelled'

  // ─── P&L ───
  pnl: real('pnl'),                          // Realized P&L for this trade (USD)
  pnlPercentage: real('pnl_percentage'),     // ROI %
  fees: real('fees'),                        // Exchange execution fees

  // ─── Context ───
  aiReasoning: text('ai_reasoning'),         // AI's explanation for the decision
  marketSnapshot: jsonb('market_snapshot'),   // { price, rsi, ema50, ema200, volume, bid, ask, ... }
  errorDetails: text('error_details'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});
