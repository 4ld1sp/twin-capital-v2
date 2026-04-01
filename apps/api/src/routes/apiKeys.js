import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  createApiKey,
  getApiKeys,
  updateApiKey,
  deleteApiKey,
  testConnection,
  setConnectionStatus,
} from '../services/apiKeyService.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/keys?category=trading
 * Returns all API keys for the authenticated user (masked secrets).
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const keys = await getApiKeys(req.user.id, category || null);
    res.json({ keys });
  } catch (err) {
    console.error('[GET /api/keys]', err);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

/**
 * POST /api/keys
 * Create a new API key (encrypts fields server-side).
 */
router.post('/', async (req, res) => {
  try {
    const { platformId, category, name, fields, isConnected } = req.body;

    if (!platformId || !category || !name || !fields) {
      return res.status(400).json({ error: 'Missing required fields: platformId, category, name, fields' });
    }

    const key = await createApiKey(req.user.id, { platformId, category, name, fields, isConnected });
    res.status(201).json({ key });
  } catch (err) {
    console.error('[POST /api/keys]', err);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

/**
 * PUT /api/keys/:id
 * Update an existing API key's fields (re-encrypts).
 */
router.put('/:id', async (req, res) => {
  try {
    const { fields, name, isConnected } = req.body;
    const key = await updateApiKey(req.params.id, req.user.id, { fields, name, isConnected });

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ key });
  } catch (err) {
    console.error('[PUT /api/keys/:id]', err);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

/**
 * DELETE /api/keys/:id
 * Remove an API key (ownership verified).
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteApiKey(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ success: true, deleted });
  } catch (err) {
    console.error('[DELETE /api/keys/:id]', err);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * POST /api/keys/test
 * Test connectivity (no auth required on the exchange side, just validates the key format).
 */
router.post('/test', async (req, res) => {
  try {
    const { platformId, fields } = req.body;

    if (!platformId || !fields) {
      return res.status(400).json({ error: 'Missing platformId or fields' });
    }

    const result = await testConnection(platformId, fields);
    res.json(result);
  } catch (err) {
    console.error('[POST /api/keys/test]', err);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

/**
 * PATCH /api/keys/:id/status
 * Toggle connected status.
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { isConnected } = req.body;
    const key = await setConnectionStatus(req.params.id, req.user.id, isConnected);

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ key });
  } catch (err) {
    console.error('[PATCH /api/keys/:id/status]', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
