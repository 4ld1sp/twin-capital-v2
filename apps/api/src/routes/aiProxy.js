import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getDecryptedKey } from '../services/apiKeyService.js';

const router = Router();
router.use(requireAuth);

/**
 * POST /api/proxy/ai/chat
 * Proxies chat completion requests to the user's connected AI platform.
 * Body: { messages: [...], model?: string, maxTokens?: number }
 */
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user.id;
    const { messages, model, maxTokens = 2048 } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Try to find connected AI key — prefer Minimax first, then others
    const preferredPlatforms = ['minimax', 'openai', 'anthropic', 'gemini'];
    let keyData = null;
    let activePlatform = null;

    for (const platformId of preferredPlatforms) {
      const found = await getDecryptedKey(userId, platformId);
      if (found && found.isConnected) {
        keyData = found;
        activePlatform = platformId;
        break;
      }
    }

    if (!keyData) {
      return res.status(404).json({ 
        error: 'No AI API key connected. Please add one in Settings → API Config (AI section).' 
      });
    }

    const fields = keyData.fields;
    let aiResponse;

    switch (activePlatform) {
      case 'minimax': {
        const url = `https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=${fields.group_id}`;
        
        const reqBody = {
          model: model || 'MiniMax-M2.7-highspeed',
          messages,
          tokens_to_generate: maxTokens,
          temperature: 0.7,
        };
        
        console.log(`[AI Proxy] Calling Minimax: GroupId=${fields.group_id}, model=${reqBody.model}, msgs=${messages.length}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fields.key}`,
            'Content-Type': 'application/json',
            'GroupId': fields.group_id,
          },
          body: JSON.stringify(reqBody),
        });
        
        const rawText = await response.text();
        console.log(`[AI Proxy] Minimax HTTP status: ${response.status}`);
        console.log(`[AI Proxy] Minimax raw response (first 500 chars):`, rawText.substring(0, 500));
        
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          console.error('[AI Proxy] Minimax JSON parse error:', parseErr.message);
          return res.status(502).json({ error: `Minimax returned invalid JSON: ${rawText.substring(0, 200)}`, platform: 'minimax' });
        }
        
        if (data.base_resp?.status_code !== 0) {
          return res.status(502).json({ 
            error: `Minimax API Error: ${data.base_resp?.status_msg || 'Unknown error'} (code: ${data.base_resp?.status_code})`,
            platform: 'minimax'
          });
        }

        aiResponse = {
          content: data.choices?.[0]?.message?.content || data.reply || '',
          model: data.model || 'MiniMax-M2.7-highspeed',
          platform: 'minimax',
          usage: data.usage || {},
        };
        break;
      }

      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${fields.key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages,
            max_tokens: maxTokens,
          }),
        });
        const data = await response.json();
        
        if (data.error) {
          return res.status(502).json({ error: `OpenAI Error: ${data.error.message}`, platform: 'openai' });
        }

        aiResponse = {
          content: data.choices?.[0]?.message?.content || '',
          model: data.model || 'gpt-4o-mini',
          platform: 'openai',
          usage: data.usage || {},
        };
        break;
      }

      case 'anthropic': {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': fields.key,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: model || 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            messages,
          }),
        });
        const data = await response.json();
        
        if (data.error) {
          return res.status(502).json({ error: `Anthropic Error: ${data.error.message}`, platform: 'anthropic' });
        }

        aiResponse = {
          content: data.content?.[0]?.text || '',
          model: data.model || 'claude-3-5-sonnet',
          platform: 'anthropic',
          usage: data.usage || {},
        };
        break;
      }

      case 'gemini': {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${fields.key}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : m.role,
              parts: [{ text: m.content }],
            })),
          }),
        });
        const data = await response.json();
        
        if (data.error) {
          return res.status(502).json({ error: `Gemini Error: ${data.error.message}`, platform: 'gemini' });
        }

        aiResponse = {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          model: model || 'gemini-2.0-flash',
          platform: 'gemini',
          usage: {},
        };
        break;
      }

      default:
        return res.status(400).json({ error: `Unsupported AI platform: ${activePlatform}` });
    }

    return res.json(aiResponse);

  } catch (err) {
    console.error('[AI Proxy Error]', err);
    return res.status(500).json({ error: 'Internal server error while calling AI API' });
  }
});

export default router;
