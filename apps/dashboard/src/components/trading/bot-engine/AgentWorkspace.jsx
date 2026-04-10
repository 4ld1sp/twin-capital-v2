import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, BrainCircuit, Activity, CheckCircle2, ChevronRight, BarChart3, Bot, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DeployBotModal from '../DeployBotModal'; // Reuse existing deploy modal
import { useTrading } from '../../../context/TradingContext';

const AgentWorkspace = () => {
  const { saveStrategy } = useTrading();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(''); // '', 'generating', 'backtesting', 'analyzing', 'done'
  
  // Data state
  const [strategies, setStrategies] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [deployStrategy, setDeployStrategy] = useState(null); // When set, opens deploy modal

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, workflowStatus]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/agent/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chart history', err);
    }
  };

  const handleClear = async () => {
    await fetch('/api/agent/chat/clear', { method: 'POST' });
    setMessages([]);
    setStrategies([]);
    setRecommendation('');
    setWorkflowStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', message: userMsg }]);
    
    setIsLoading(true);
    setWorkflowStatus(''); // Clear workflow status just in case

    try {
      const res = await fetch('/api/agent/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      let data;
      try {
        const textRes = await res.text();
        data = textRes ? JSON.parse(textRes) : {};
      } catch (e) {
        throw new Error('Server connection lost or returned an invalid response. Please try again.');
      }
      
      if (!res.ok) throw new Error(data.error || 'Server Error');
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + '-ai', 
        role: 'ai', 
        message: data.reply 
      }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + '-err', 
        role: 'ai', 
        message: `❌ **Error:** ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStrategies([]);
    setRecommendation('');
    
    // Animate workflow text
    setWorkflowStatus('generating');
    setTimeout(() => { setWorkflowStatus(prev => prev === 'generating' ? 'backtesting' : prev) }, 8000);
    setTimeout(() => { setWorkflowStatus(prev => prev === 'backtesting' ? 'analyzing' : prev) }, 15000);

    try {
      const res = await fetch('/api/agent/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      let data;
      try {
        const textRes = await res.text();
        data = textRes ? JSON.parse(textRes) : {};
      } catch (e) {
        throw new Error('Server connection lost or returned an invalid response. Please try again.');
      }
      
      if (!res.ok) throw new Error(data.error || 'Server Error');
      const newStrategies = data.strategies || [];
      setStrategies(newStrategies);
      setRecommendation(data.recommendation || '');
      setWorkflowStatus('done');
      
      // Save them globally so they appear in Backtests / Saved Strategies
      newStrategies.forEach(s => {
        saveStrategy({
          id: s.id,
          name: s.name,
          symbol: s.symbol,
          timeframe: s.interval,
          language: 'pine',
          script: s.script,
          results: {
            winRate: `${s.backtestResults?.winrate || 0}%`,
            totalPnL: `$${s.backtestResults?.totalPnl || 0}`,
            maxDrawdown: `${s.backtestResults?.maxDrawdown || 0}%`,
            totalTrades: s.backtestResults?.totalTrades || 0,
            profitFactor: '1.5', // Simulated
            sharpeRatio: '1.2' // Simulated
          }
        });
      });
      
      // Add the final text to the UI as an AI message explicitly
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + '-ai', 
        role: 'ai', 
        message: data.recommendation 
      }]);

    } catch (err) {
      console.error(err);
      const errMsg = err.message || 'Could not reach AI backend';
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + '-err', 
        role: 'ai', 
        message: `❌ **Error executing Quant workflow:** ${errMsg}. Please verify your Minimax API key and check if the AI is overloaded.` 
      }]);
      setWorkflowStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployAIStrategy = async (config) => {
    try {
      const res = await fetch('/api/bots/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyName: config.strategyName || config.name || "Custom Strategy",
          strategyScript: config.script || `// Auto-generated script for ${config.symbol}\nstrategy("Auto", overlay=true)\nif close > open\n    strategy.entry("Long", strategy.long)\n`,
          symbol: config.symbol,
          exchange: 'bybit', // Inherit from system defaults or configure later
          networkMode: config.networkMode,
          signalInterval: config.signalInterval,
          riskInterval: config.riskInterval,
          leverage: config.leverage,
          maxDailyLossPct: config.maxDailyLossPct,
          maxPositions: config.maxPositions,
          maxTradesPerDay: config.maxTradesPerDay,
          trailingStopActivationPct: config.trailingStopActivationPct,
          trailingStopCallbackPct: config.trailingStopCallbackPct,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deploy bot');
      
      alert(data.message || 'Bot deployed successfully! You can monitor it in the Tracking dashboard.');
      setDeployStrategy(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full h-[800px]">
      
      {/* ── Chat / Ideation Panel ── */}
      <div className="flex-1 flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl h-full relative">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-black/20 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight uppercase">Quant Agent</h2>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRunWorkflow}
              disabled={isLoading || workflowStatus && workflowStatus !== 'done'}
              className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 px-3 py-1.5 rounded transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" /> Execute Strategies
            </button>
            <button onClick={handleClear} className="text-[10px] text-[var(--text-secondary)] font-bold uppercase hover:text-white px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
              Clear Context
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-black/10">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-8">
              <Bot className="w-16 h-16 text-[var(--text-secondary)] mb-4 drop-shadow-xl" />
              <p className="text-[var(--text-primary)] font-bold mb-2">AlphaNode Quant is ready.</p>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm">Describe market conditions or your trading goals. I will ideate strategies, backtest them instantly, and recommend the best one for deployment.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-[var(--bg-main)] text-background-dark rounded-br-sm' 
                  : 'bg-[var(--bg-surface)] border border-[var(--border)]/50 text-[var(--text-primary)] rounded-bl-sm backdrop-blur-md'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Quant AI</span>
                  </div>
                )}
                <div className="text-sm prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-[var(--border)]">
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isLoading && workflowStatus === '' && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-5 py-4 bg-[var(--bg-surface)] border border-[var(--border)]/50 backdrop-blur-md shadow-xl flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs text-[var(--text-secondary)] italic">Quant is typing...</span>
              </div>
            </div>
          )}

          {isLoading && workflowStatus !== '' && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-6 py-5 bg-[var(--bg-surface)] border border-[var(--border)]/50 backdrop-blur-md shadow-xl">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Executing Quant Workflow...</span>
                  </div>
                  
                  <div className="space-y-3 pl-2 border-l-2 border-white/10">
                    <div className={`flex items-center gap-2 text-xs font-bold transition-all ${workflowStatus === 'generating' ? 'text-white' : workflowStatus !== '' ? 'text-[var(--text-secondary)] opacity-50' : 'text-secondary/30'}`}>
                      {workflowStatus === 'generating' ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : <ChevronRight className="w-3 h-3" />}
                      1. Generating 3 Diverse Strategies...
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold transition-all ${workflowStatus === 'backtesting' ? 'text-white' : workflowStatus === 'analyzing' || workflowStatus === 'done' ? 'text-[var(--text-secondary)] opacity-50' : 'text-secondary/30'}`}>
                      {workflowStatus === 'backtesting' ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : <ChevronRight className="w-3 h-3" />}
                      2. Deep-Simulating Historical Backtests...
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold transition-all ${workflowStatus === 'analyzing' ? 'text-white' : workflowStatus === 'done' ? 'text-[var(--text-secondary)] opacity-50' : 'text-secondary/30'}`}>
                      {workflowStatus === 'analyzing' ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : <ChevronRight className="w-3 h-3" />}
                      3. Analyzing Metrics & Drafting Recommendation...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-black/20 border-t border-[var(--border)] backdrop-blur-xl shrink-0">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              placeholder="e.g. 'Beri saya ide trading harian untuk BTC'"
              rows={1}
              className="w-full bg-black/30 outline-none text-[var(--text-primary)] placeholder-secondary/50 rounded-2xl py-4 pl-5 pr-14 border border-[var(--border)] focus:border-primary/50 transition-colors shadow-inner resize-none min-h-[56px] max-h-[150px] overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-[var(--text-secondary)] hover:brightness-110 transition-all font-bold shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Right Panel: Backtest Results & Deployment ── */}
      {strategies.length > 0 && (
        <div className="w-[450px] shrink-0 flex flex-col gap-4 animate-in slide-in-from-right-8 duration-500">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl border border-[var(--border)] p-5 shadow-2xl relative overflow-hidden">
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4" /> Final Recommendation
            </h3>
            <div className="text-sm text-main/90 italic leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 relative z-10">
              "{recommendation.substring(0, 300)}..."
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2 pl-1">
              <BarChart3 className="w-3 h-3" /> Candidate Strategies
            </h4>
            
            {strategies.map((strat, i) => {
              const res = strat.backtestResults;
              const isProfitable = res.totalPnl > 0;
              const isWinner = res.totalPnl === Math.max(...strategies.map(s => s.backtestResults.totalPnl));

              return (
                <div key={i} className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden ${isWinner ? 'border-primary shadow-primary/10 bg-primary/5' : 'border-[var(--border)] '}`}>
                  
                  {isWinner && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/30">
                      Best ROI
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2 pr-12">
                    <div>
                      <h4 className="text-base font-bold text-[var(--text-primary)]">{strat.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{strat.prompt}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest block mb-1">Winrate</span>
                      <span className={`text-lg font-black ${res.winrate > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{res.winrate}%</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest block mb-1">Simulated PnL</span>
                      <span className={`text-lg font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : ''}${res.totalPnl}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 col-span-2 flex justify-between items-center">
                      <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">Drawdown</span>
                      <span className={`text-sm font-bold ${res.maxDrawdown > 15 ? 'text-rose-400' : 'text-[var(--text-primary)]'}`}>-{res.maxDrawdown}%</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setDeployStrategy(strat)}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isWinner 
                        ? 'bg-primary text-black hover:brightness-110 shadow-primary/25' 
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 shadow-black/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Deploy to Live Trading
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deploy Modal Overlay */}
      {!!deployStrategy && (
        <DeployBotModal 
          strategy={deployStrategy} 
          onClose={() => setDeployStrategy(null)}
          onDeploy={handleDeployAIStrategy}
        />
      )}
    </div>
  );
};

export default AgentWorkspace;
