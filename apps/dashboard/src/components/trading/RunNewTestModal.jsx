import React, { useState, useRef } from 'react';
import { useTrading } from '../../context/TradingContext';
import PineScriptEditor from './PineScriptEditor';
import GlassDateInput from '../ui/GlassDateInput';
import { generateStrategy } from '../../services/aiService';

const RunNewTestModal = ({ isOpen, onClose, onTestComplete }) => {
  const { activeSymbol, activeTimeframe } = useTrading();
  const [activeWorkflow, setActiveWorkflow] = useState('upload'); // 'upload' | 'editor' | 'ai'
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [scriptLanguage, setScriptLanguage] = useState('pine'); // 'pine' | 'python'
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2025-03-01');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiPlatform, setAiPlatform] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScriptContent(ev.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleRunTest = (source) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onTestComplete) {
        onTestComplete({
          name: fileName || `AI Strategy — ${activeSymbol}`,
          symbol: activeSymbol,
          timeframe: activeTimeframe,
          dateFrom,
          dateTo,
          script: scriptContent,
          language: scriptLanguage,
          source,
        });
      }
      onClose();
    }, 2500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      handleRunTest('upload');
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    try {
      const result = await generateStrategy({
        prompt: aiPrompt,
        symbol: activeSymbol,
        language: scriptLanguage,
        existingScript: scriptContent || '',
      });
      setScriptContent(result.script);
      setFileName(result.name);
      setAiPlatform(result.platform);
    } catch (err) {
      console.error('[AI Generate Error]', err);
      setAiError(err.message || 'Failed to generate strategy. Check your AI API key in Settings.');
    } finally {
      setAiGenerating(false);
    }
  };

  const timeframeLabel = {
    '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
    '60': '1h', '120': '2h', '240': '4h', 'D': '1D', 'W': '1W',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card border border-glass rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-glass flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">science</span>
            <div>
              <h3 className="text-main text-lg font-black uppercase tracking-tight">Run New Backtest</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">{activeSymbol}</span>
                <span className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-glass text-secondary text-[9px] font-black uppercase tracking-widest">{timeframeLabel[activeTimeframe] || activeTimeframe}</span>
                <span className="text-secondary text-[9px] font-bold">• Synced from Chart</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border border-glass flex items-center justify-center text-secondary hover:text-main transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-2xl">analytics</span>
            </div>
            <div className="text-center">
              <p className="text-main text-base font-black uppercase tracking-widest">Running Backtest</p>
              <p className="text-secondary text-xs font-bold mt-1">Analyzing {activeSymbol} on {timeframeLabel[activeTimeframe] || activeTimeframe} timeframe...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {/* Workflow Tabs */}
            <div className="px-8 pt-6 pb-4">
              <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-glass w-fit">
                {[
                  { id: 'upload', icon: 'upload_file', label: 'Upload CSV' },
                  { id: 'editor', icon: 'code', label: 'Edit Script' },
                  { id: 'ai', icon: 'auto_awesome', label: 'Generate with AI' },
                ].map(w => (
                  <button
                    key={w.id}
                    onClick={() => setActiveWorkflow(w.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeWorkflow === w.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{w.icon}</span>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="px-8 pb-4">
              <div className="flex items-end gap-4">
                <GlassDateInput 
                  label="From" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 max-w-[200px]"
                />
                <GlassDateInput 
                  label="To" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 max-w-[200px]"
                />
                {/* Language Selector */}
                <div className="flex items-center gap-1 p-0.5 bg-black/5 dark:bg-white/5 rounded-lg border border-glass ml-auto">
                  <button onClick={() => setScriptLanguage('pine')}
                    className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${scriptLanguage === 'pine' ? 'bg-primary text-black' : 'text-secondary hover:text-main'}`}>
                    Pine Script
                  </button>
                  <button onClick={() => setScriptLanguage('python')}
                    className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${scriptLanguage === 'python' ? 'bg-primary text-black' : 'text-secondary hover:text-main'}`}>
                    Python
                  </button>
                </div>
              </div>
            </div>

            {/* Workflow Content */}
            <div className="px-8 pb-6">
              {/* UPLOAD WORKFLOW */}
              {activeWorkflow === 'upload' && (
                <div className="space-y-4">
                  <div
                    className={`w-full border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                      isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-glass hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept=".csv,.json,.txt,.pine,.py" className="hidden" onChange={(e) => { handleFileSelect(e); }} />
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-primary/20' : 'bg-black/5 dark:bg-white/5'}`}>
                        <span className={`material-symbols-outlined text-2xl ${isDragging ? 'text-primary' : 'text-secondary'}`}>upload_file</span>
                      </div>
                      <p className="text-main text-sm font-black uppercase tracking-widest">{isDragging ? 'Drop to Analyze' : 'Upload Strategy Export'}</p>
                      <p className="text-secondary text-xs font-bold">Drag & drop TradingView CSV, Pine Script, or Python file</p>
                      <div className="flex items-center gap-2 mt-1">
                        {['.CSV', '.JSON', '.PINE', '.PY', '.TXT'].map(ext => (
                          <span key={ext} className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-glass text-[9px] font-black text-secondary uppercase tracking-widest">{ext}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {fileName && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-lg">description</span>
                      <span className="text-main text-xs font-black flex-1">{fileName}</span>
                      <button onClick={() => handleRunTest('upload')} className="px-4 py-2 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                        Run Test
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-glass"></div>
                    <span className="text-secondary text-[10px] font-black uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-glass"></div>
                  </div>

                  <button onClick={() => { setFileName('Alpha v2.1 — BTC Momentum'); handleRunTest('demo'); }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                    Load Demo Strategy Data
                  </button>
                </div>
              )}

              {/* EDITOR WORKFLOW */}
              {activeWorkflow === 'editor' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Strategy Name"
                      className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass text-main text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-secondary/40" />
                  </div>
                  
                  <PineScriptEditor 
                    value={scriptContent}
                    onChange={setScriptContent}
                    language={scriptLanguage}
                    height="320px"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleRunTest('editor')} disabled={!scriptContent.trim()}
                      className="flex-1 px-6 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">play_arrow</span>
                      Run Backtest
                    </button>
                    <button onClick={() => { setActiveWorkflow('ai'); }}
                      className="px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      Improve with AI
                    </button>
                  </div>
                </div>
              )}

              {/* AI GENERATE WORKFLOW */}
              {activeWorkflow === 'ai' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-violet-400 text-lg">auto_awesome</span>
                      <p className="text-main text-sm font-black uppercase tracking-widest">AI Strategy Generator</p>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest ml-auto">{aiPlatform ? `Powered by ${aiPlatform}` : 'Live AI'}</span>
                    </div>
                    <p className="text-secondary text-xs font-bold mb-4">
                      Describe your strategy idea or paste existing code for AI optimization. The AI will generate/improve a {scriptLanguage === 'pine' ? 'Pine Script' : 'Python'} strategy for {activeSymbol}.
                    </p>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Create a momentum strategy using EMA crossover with RSI filter. Entry on bullish crossover when RSI < 70, exit on bearish cross or RSI > 80. Use 3% take profit and 1.5% stop loss."
                      className="w-full h-24 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass text-main text-xs font-bold outline-none focus:border-violet-500 transition-all resize-none placeholder:text-secondary/40"
                    />
                    {aiError && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {aiError}
                      </div>
                    )}
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      className="mt-3 w-full px-6 py-3 rounded-xl bg-violet-500 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aiGenerating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
                      ) : (
                        <><span className="material-symbols-outlined text-base">magic_button</span> Generate Strategy</>
                      )}
                    </button>
                  </div>

                  {scriptContent && (
                    <>
                      <div className="flex items-center gap-3">
                        <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Strategy Name"
                          className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-glass text-main text-sm font-bold outline-none focus:border-primary transition-all placeholder:text-secondary/40" />
                      </div>
                      <PineScriptEditor 
                        value={scriptContent}
                        onChange={setScriptContent}
                        language={scriptLanguage}
                        height="320px"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => handleRunTest('ai')}
                          className="flex-1 px-6 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">play_arrow</span>
                          Run Backtest
                        </button>
                        <button onClick={handleAiGenerate} disabled={aiGenerating}
                          className="px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
                          <span className="material-symbols-outlined text-base">auto_awesome</span>
                          Re-generate
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoading && (
          <div className="px-8 py-4 border-t border-glass flex justify-end shrink-0">
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-secondary text-[10px] font-black uppercase tracking-widest hover:text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunNewTestModal;
