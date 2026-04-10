import { Router } from 'express';
import { operatorAuth } from '../middleware/operatorAuth.js';
import { db } from '../db/index.js';
import { savedStrategies, agentChats } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { 
  chatWithAgent,
  generateStrategies, 
  processAndSaveStrategies, 
  recommendStrategy, 
  clearChatHistory 
} from '../services/quantAgentService.js';

const router = Router();
router.use(operatorAuth);

// ─── Get Chat History ──────────────────────────────────────────
router.get('/chat', async (req, res) => {
  try {
    const history = await db.select().from(agentChats)
      .where(eq(agentChats.userId, req.user.id))
      .orderBy(agentChats.createdAt);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Clear Chat ────────────────────────────────────────────────
router.post('/chat/clear', async (req, res) => {
  try {
    await clearChatHistory(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Post Message & Trigger Quant Workflow ─────────────────────
// The client posts a message: "I want a scalp strategy for BTC."
// The server will:
// 1. Generate 3 strategies via AI
// 2. Backtest them instantly
// 3. Recommend the best one via AI
// 4. Return all data to the client
// ─── Post Chat Message ─────────────────────────────────────────
router.post('/chat/send', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await chatWithAgent(req.user.id, message);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Trigger Quant Workflow ────────────────────────────────────
router.post('/workflow', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[QuantAgent] Flow 1: Generating Strategies based on context`);
    const strategies = await generateStrategies(userId);

    console.log(`[QuantAgent] Flow 2: Simulating Backtests for 3 strategies...`);
    const evaluatedStrategies = await processAndSaveStrategies(userId, strategies);

    console.log(`[QuantAgent] Flow 3: AI Recommendation...`);
    const recommendation = await recommendStrategy(userId, evaluatedStrategies);

    res.json({
      success: true,
      strategies: evaluatedStrategies,
      recommendation
    });
  } catch (err) {
    console.error("[QuantAgent Workflow Error]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Fetch Saved Strategies ────────────────────────────────────
router.get('/saved', async (req, res) => {
  try {
    const strategies = await db.select().from(savedStrategies)
      .where(eq(savedStrategies.userId, req.user.id))
      .orderBy(desc(savedStrategies.createdAt));
    res.json(strategies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
