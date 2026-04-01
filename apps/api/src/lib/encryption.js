import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;     // GCM standard
const TAG_LENGTH = 16;    // GCM auth tag

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a hex string: iv (12B) + authTag (16B) + ciphertext
 */
export function encrypt(plaintext) {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: IV + AuthTag + Ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

/**
 * Decrypt a hex-encoded AES-256-GCM ciphertext.
 * Input format: iv (12B) + authTag (16B) + ciphertext
 */
export function decrypt(hexString) {
  const key = getEncryptionKey();
  const buffer = Buffer.from(hexString, 'hex');

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Encrypt a JavaScript object (serialized to JSON first).
 */
export function encryptJSON(obj) {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt a hex string back into a JavaScript object.
 */
export function decryptJSON(hexString) {
  return JSON.parse(decrypt(hexString));
}

/**
 * Mask a secret value for safe client display.
 * "sk-binance-xxx-long-key" → "sk-b****key"
 */
export function maskSecret(value) {
  if (!value || typeof value !== 'string') return '****';
  if (value.length <= 6) return '****';
  return value.slice(0, 4) + '****' + value.slice(-3);
}
