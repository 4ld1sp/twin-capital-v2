/**
 * Frontend AI Service
 * Calls the backend AI proxy which routes to the user's connected AI platform.
 */

const AI_PROXY_BASE = '/api/proxy/ai';

/**
 * Send a chat completion request through the backend AI proxy.
 * The backend automatically selects the user's connected AI provider.
 * 
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages - Chat messages
 * @param {string} [options.model] - Override model name
 * @param {number} [options.maxTokens] - Max tokens to generate
 * @returns {Promise<{content: string, model: string, platform: string}>}
 */
export async function chatCompletion({ messages, model, maxTokens = 2048 }) {
  try {
    const res = await fetch(`${AI_PROXY_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, model, maxTokens }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(error.error || `AI request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[AI Service] Error:', err);
    throw err;
  }
}

/**
 * Generate a trading strategy script using AI.
 * 
 * @param {Object} options
 * @param {string} options.prompt - User's strategy description
 * @param {string} options.symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {string} options.language - 'pine' or 'python'
 * @param {string} [options.existingScript] - Existing script to improve
 * @returns {Promise<{script: string, name: string, model: string, platform: string}>}
 */
export async function generateStrategy({ prompt, symbol, language = 'pine', existingScript = '' }) {
  const systemPrompt = `You are an expert quantitative trading strategy developer. You create precise, well-documented trading strategies.

IMPORTANT RULES:
1. Output ONLY the strategy code — no explanations, no markdown, no code fences.
2. The strategy must be complete and ready to use.
3. Include clear comments for key logic.
4. Use proper risk management (stop loss, take profit).
5. Target the ${symbol} trading pair.

${language === 'pine' ? `
Write in Pine Script v5 for TradingView:
- Use //@version=5
- Use strategy() function with overlay=true
- Include strategy.entry() and strategy.exit() calls
- Use default_qty_type=strategy.percent_of_equity, default_qty_value=10
` : `
Write in Python using a simple backtesting framework:
- Create a Strategy class with init() and next() methods
- Use self.buy() and self.sell() with tp/sl parameters
- Include proper position sizing
`}`;

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  if (existingScript) {
    messages.push({
      role: 'user',
      content: `Here is my existing strategy code that needs improvement:\n\n${existingScript}\n\nPlease improve it based on this request: ${prompt}`,
    });
  } else {
    messages.push({
      role: 'user',
      content: `Create a ${language === 'pine' ? 'Pine Script v5' : 'Python'} trading strategy for ${symbol} based on this description:\n\n${prompt}`,
    });
  }

  const result = await chatCompletion({ messages, maxTokens: 4096 });

  // Clean up the response — strip any code fences if the AI adds them
  let script = result.content || '';
  script = script.replace(/^```[\w]*\n?/gm, '').replace(/```\s*$/gm, '').trim();

  // Generate a name from the prompt
  const nameMatch = prompt.match(/(?:create|build|make)\s+(?:a\s+)?(.{10,40})/i);
  const name = nameMatch ? nameMatch[1].trim() : `AI Strategy — ${symbol}`;

  return {
    script,
    name,
    model: result.model,
    platform: result.platform,
  };
}

/**
 * Analyze a backtest result and provide AI insights.
 * 
 * @param {Object} results - Backtest performance metrics
 * @returns {Promise<{analysis: string, model: string, platform: string}>}
 */
export async function analyzeBacktest(results) {
  const messages = [
    {
      role: 'system',
      content: `You are a senior quantitative analyst. Analyze the following backtest results and provide:
1. A brief summary of overall performance (2-3 lines)
2. Key strengths (bullet points)
3. Key weaknesses (bullet points)
4. Specific recommendations for improvement (bullet points)

Be concise and actionable. Use plain text, no markdown formatting.`,
    },
    {
      role: 'user',
      content: `Backtest Results:\n${JSON.stringify(results, null, 2)}`,
    },
  ];

  const result = await chatCompletion({ messages, maxTokens: 1024 });

  return {
    analysis: result.content,
    model: result.model,
    platform: result.platform,
  };
}
