import { Router } from 'express';
import { db } from '../db/index.js';
import { assetsSaham } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/assets-saham
 * Fetch all stock assets for the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const assets = await db.select().from(assetsSaham)
      .where(eq(assetsSaham.userId, req.user.id));
    
    res.json({ success: true, assets });
  } catch (err) {
    console.error('[AssetSaham] Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

/**
 * POST /api/assets-saham
 * Add a new stock asset.
 */
router.post('/', async (req, res) => {
  try {
    const { ticker, name, lots, entryPrice, color } = req.body;
    
    if (!ticker || !lots || !entryPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = nanoid();
    await db.insert(assetsSaham).values({
      id,
      userId: req.user.id,
      ticker: ticker.toUpperCase(),
      name: name || ticker,
      lots: parseInt(lots),
      entryPrice: parseFloat(entryPrice),
      color: color || 'indigo',
    });

    const [newAsset] = await db.select().from(assetsSaham).where(eq(assetsSaham.id, id));
    res.status(201).json({ success: true, asset: newAsset });
  } catch (err) {
    console.error('[AssetSaham] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

/**
 * PUT /api/assets-saham/:id
 * Update an existing stock asset.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ticker, name, lots, entryPrice, color } = req.body;

    await db.update(assetsSaham)
      .set({
        ticker: ticker?.toUpperCase(),
        name,
        lots: lots ? parseInt(lots) : undefined,
        entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
        color,
        updatedAt: new Date(),
      })
      .where(and(eq(assetsSaham.id, id), eq(assetsSaham.userId, req.user.id)));

    const [updatedAsset] = await db.select().from(assetsSaham).where(eq(assetsSaham.id, id));
    res.json({ success: true, asset: updatedAsset });
  } catch (err) {
    console.error('[AssetSaham] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

/**
 * DELETE /api/assets-saham/:id
 * Remove a stock asset.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(assetsSaham)
      .where(and(eq(assetsSaham.id, id), eq(assetsSaham.userId, req.user.id)));

    res.json({ success: true, message: 'Asset deleted' });
  } catch (err) {
    console.error('[AssetSaham] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;
