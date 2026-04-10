import { db } from '../db/index.js';
import { apiKeys } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { encryptJSON, decryptJSON, maskSecret } from '../lib/encryption.js';
import { randomBytes, createHmac } from 'crypto';

/**
 * Create a new API key connection (encrypted at rest).
 */
export async function createApiKey(userId, { platformId, category, name, fields, isConnected = false }) {
  const id = `ak_${randomBytes(12).toString('hex')}`;
  const encryptedFields = encryptJSON(fields);

  const [row] = await db.insert(apiKeys).values({
    id,
    userId,
    platformId,
    category,
    name,
    encryptedFields,
    isConnected,
    lastSyncedAt: isConnected ? new Date() : null,
  }).returning();

  return { ...row, fields: maskFields(fields) };
}

/**
 * Get all API keys for a user (optionally filtered by category).
 * Returns MASKED field values — secrets are never exposed to the client.
 */
export async function getApiKeys(userId, category = null) {
  const conditions = [eq(apiKeys.userId, userId)];
  if (category) {
    conditions.push(eq(apiKeys.category, category));
  }

  const rows = await db
    .select()
    .from(apiKeys)
    .where(and(...conditions))
    .orderBy(apiKeys.createdAt);

  return rows.map(row => ({
    id: row.id,
    platformId: row.platformId,
    category: row.category,
    name: row.name,
    isConnected: row.isConnected,
    lastSyncedAt: row.lastSyncedAt,
    createdAt: row.createdAt,
    // Decrypt then mask for client display
    fields: maskFields(decryptJSON(row.encryptedFields)),
  }));
}

/**
 * Get DECRYPTED fields for a specific platform key.
 * INTERNAL USE ONLY — for server-side API calls (exchange proxy).
 */
export async function getDecryptedKey(userId, platformId) {
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.platformId, platformId)))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    fields: decryptJSON(row.encryptedFields),
  };
}

/**
 * Update API key fields (re-encrypt).
 */
export async function updateApiKey(id, userId, { fields, name, isConnected }) {
  const updates = { updatedAt: new Date() };

  if (fields) {
    updates.encryptedFields = encryptJSON(fields);
  }
  if (name) {
    updates.name = name;
  }
  if (isConnected !== undefined) {
    updates.isConnected = isConnected;
    if (isConnected) updates.lastSyncedAt = new Date();
  }

  const [row] = await db
    .update(apiKeys)
    .set(updates)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .returning();

  if (!row) return null;

  return {
    ...row,
    fields: maskFields(fields || decryptJSON(row.encryptedFields)),
  };
}

/**
 * Delete an API key (with ownership check).
 */
export async function deleteApiKey(id, userId) {
  const [deleted] = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .returning();

  return deleted || null;
}

/**
 * Test a connection by making a lightweight API call based on the platform.
 * Returns { success: boolean, latency: number, message: string }
 */
export async function testConnection(platformId, fields) {
  const startTime = Date.now();
  let url, options = { signal: AbortSignal.timeout(5000) };

  try {
    switch (platformId) {
      // ─── MANDATORY FIELD CHECKS ───
      case 'minimax':
        if (!fields.group_id || !fields.key) {
          return { success: false, latency: 0, message: 'Ping Failed: Group ID and API Key are required' };
        }
        break;
      case 'openai':
      case 'anthropic':
      case 'gemini':
      case 'telegram':
        if (!fields.key && !fields.token && !fields.api_key) {
          return { success: false, latency: 0, message: 'Ping Failed: Credentials missing' };
        }
        break;
    }

    switch (platformId) {
      // ─── TRADING ───
      case 'bybit':
      case 'binance':
      case 'okx':
      case 'exness':
        if (!fields.key || !fields.secret) {
          return { success: false, latency: 0, message: 'Ping Failed: API Key and Secret are required' };
        }
        break;
    }

    switch (platformId) {
      // ─── TRADING (Authenticated) ───
      case 'bybit': {
        // Use HMAC-SHA256 signed request to validate the key pair
        const timestamp = Date.now().toString();
        const recvWindow = '5000';
        const queryString = 'accountType=UNIFIED';
        const preSign = `${timestamp}${fields.key}${recvWindow}${queryString}`;
        const signature = createHmac('sha256', fields.secret).update(preSign).digest('hex');
        
        url = `https://api.bytick.com/v5/account/wallet-balance?${queryString}`;
        options.headers = {
          'X-BAPI-API-KEY': fields.key,
          'X-BAPI-SIGN': signature,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': recvWindow,
        };
        break;
      }
      case 'binance':
        url = 'https://api.binance.com/api/v3/time';
        break;
      case 'okx':
        url = 'https://www.okx.com/api/v5/public/time';
        break;

      // ─── AI MODELS ───
      case 'openai':
        url = 'https://api.openai.com/v1/models';
        options.headers = { 'Authorization': `Bearer ${fields.key}` };
        break;
      case 'anthropic':
        url = 'https://api.anthropic.com/v1/models';
        options.headers = { 
          'x-api-key': fields.key,
          'anthropic-version': '2023-06-01'
        };
        break;
      case 'gemini':
        url = `https://generativelanguage.googleapis.com/v1beta/models?key=${fields.key}`;
        break;
      case 'minimax':
        url = `https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=${fields.group_id}`;
        options.method = 'POST';
        options.headers = { 
          'Authorization': `Bearer ${fields.key}`,
          'Content-Type': 'application/json',
          'GroupId': fields.group_id
        };
        options.body = JSON.stringify({
          model: "MiniMax-M2.7-highspeed",
          messages: [{ role: "user", content: "ping" }],
          tokens_to_generate: 1
        });
        console.log(`[DEBUG] Pinging Minimax: URL=${url}, GroupId=${fields.group_id}`);
        break;
      case 'midjourney':
        // Typically custom proxy, we'll just validate for now
        break;

      // ─── SOCIAL MEDIA ───
      case 'telegram':
        url = `https://api.telegram.org/bot${fields.token}/getMe`;
        break;
      case 'youtube':
        url = `https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1&key=${fields.api_key}`;
        break;

      // ─── WEBHOOKS ───
      case 'openclaw':
      case 'tradingview':
      case 'custom':
        if (fields.endpoint && fields.endpoint.startsWith('http')) {
          url = fields.endpoint;
          options.method = 'POST';
          options.headers = { 'Content-Type': 'application/json' };
          if (fields.webhook_secret || fields.token) {
             options.headers['Authorization'] = `Bearer ${fields.webhook_secret || fields.token}`;
          }
          options.body = JSON.stringify({ ping: true, timestamp: Date.now() });
        }
        break;
    }

    if (!url) {
      // Fallback: Just validate fields are non-empty for unsupported ping platforms
      const allFilled = Object.values(fields).every(v => v && v.trim().length > 0);
      return { 
        success: allFilled, 
        latency: Date.now() - startTime, 
        message: allFilled ? 'Fields Validated (No Ping Available)' : 'Empty fields detected' 
      };
    }

    const res = await fetch(url, options);
    const latency = Date.now() - startTime;
    
    // Parse JSON body for both success and error to catch internal status codes
    let resData = null;
    try { resData = await res.json(); } catch(e) {}

    // Check for HTTP errors
    if (!res.ok) {
        console.log(`[DEBUG] Ping Failed ${platformId}: status=${res.status}, body=`, JSON.stringify(resData));
        let errorMsg = `HTTP ${res.status}`;
        if (resData) {
            if (resData.error?.message) errorMsg = resData.error.message;
            else if (resData.description) errorMsg = resData.description; // Telegram
            else if (resData.base_resp?.status_msg) errorMsg = resData.base_resp.status_msg; // Minimax
        }
        return { success: false, latency, message: `Ping Failed: ${errorMsg}` };
    }

    // Capture "Logical Errors" (where status is 200 but body contains failure code)
    if (resData) {
        // Bybit: retCode parsing (0 = success, 10003 = invalid key, 10004 = invalid sign)
        if (platformId === 'bybit') {
            if (resData.retCode === 0) {
                return { success: true, latency, message: `Connected — Key Verified (${latency}ms)` };
            }
            return { 
                success: false, 
                latency, 
                message: `Bybit Error: ${resData.retMsg || 'Invalid API credentials'} (code: ${resData.retCode})` 
            };
        }

        // Minimax: status_code parsing
        if (platformId === 'minimax') {
            const statusCode = resData.base_resp?.status_code;
            const statusMsg = resData.base_resp?.status_msg || 'Unknown Error';
            
            // 0 is success
            if (statusCode === 0) return { success: true, latency, message: `Connected (${latency}ms)` };
            
            // Special case: If we get a logical error that ISN'T about login (e.g. model not supported, balance), 
            // it means the GroupID and API Key were verified and accepted by the gateway!
            if (statusCode !== 1004 && statusCode !== 1003 && statusCode !== 1039) {
                return { 
                  success: true, 
                  latency, 
                  message: `Verified (${statusMsg})` 
                };
            }
            
            return { 
              success: false, 
              latency, 
              message: `Minimax Error: ${statusMsg}` 
            };
        }
        // Telegram: ok property is false
        if (platformId === 'telegram' && resData.ok === false) {
            return { 
                success: false, 
                latency, 
                message: `Telegram Error: ${resData.description || 'Invalid Token'}` 
            };
        }
    }

    return {
      success: true,
      latency,
      message: `Connected (${latency}ms)`
    };
  } catch (err) {
    console.error(`[Ping Failed] ${platformId} error:`, err);
    if (err.cause) console.error(`[Ping Failed] ${platformId} cause:`, err.cause);
    return {
      success: false,
      latency: Date.now() - startTime,
      message: err.name === 'AbortError' ? 'Connection Timeout' : err.message,
    };
  }
}

/**
 * Mark a key as connected/disconnected.
 */
export async function setConnectionStatus(id, userId, isConnected) {
  const [row] = await db
    .update(apiKeys)
    .set({
      isConnected,
      lastSyncedAt: isConnected ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .returning();

  return row || null;
}

// ─── Helpers ────────────────────────────────────────────

function maskFields(fields) {
  const masked = {};
  for (const [key, value] of Object.entries(fields)) {
    masked[key] = maskSecret(value);
  }
  return masked;
}
