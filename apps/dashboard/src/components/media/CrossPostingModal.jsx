import React, { useState, useEffect, useRef } from 'react';

/* ── Simulated Video Player Controls ─────────────────────────── */
const VideoPlayerOverlay = () => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!playing) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { setPlaying(false); return 0; }
                return prev + 0.67; // ~15s total
            });
        }, 100);
        return () => clearInterval(interval);
    }, [playing]);

    const elapsed = Math.floor((progress / 100) * 15);
    const remaining = 15 - elapsed;

    return (
        <div className="absolute inset-0 flex flex-col justify-end">
            {/* Center Play/Pause */}
            <button
                onClick={() => setPlaying(!playing)}
                className="absolute inset-0 flex items-center justify-center group"
            >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${playing ? 'bg-white/0 group-hover:bg-white/20' : 'bg-white/90'}`}>
                    {!playing && <span className="material-symbols-outlined text-slate-800 text-4xl ml-1">play_arrow</span>}
                    {playing && <span className="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">pause</span>}
                </div>
            </button>

            {/* Bottom Controls */}
            <div className="bg-gradient-to-t from-black/80 to-transparent p-4 space-y-2">
                {/* Progress Bar */}
                <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                    setProgress(Math.max(0, Math.min(100, pct)));
                }}>
                    <div className="h-full bg-primary rounded-full transition-all relative" style={{ width: `${progress}%` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
                {/* Time bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPlaying(!playing)} className="text-white hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">{playing ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <span className="text-white/70 text-[11px] font-mono">0:{String(elapsed).padStart(2, '0')} / 0:15</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-white/70 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[18px]">volume_up</span>
                        </button>
                        <button className="text-white/70 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Custom Dropdown ─────────────────────────────────────────── */
const statusOptions = [
    { value: 'backlog', label: 'Backlog', icon: 'inbox', color: 'text-slate-500' },
    { value: 'in_progress', label: 'In Progress', icon: 'pending', color: 'text-primary' },
    { value: 'review', label: 'Review', icon: 'rate_review', color: 'text-amber-500' },
    { value: 'go_live', label: 'Go Live (Publish Now)', icon: 'rocket_launch', color: 'text-emerald-500' },
];

const CustomSelect = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = statusOptions.find(o => o.value === value) || statusOptions[0];

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-left transition-colors hover:border-primary/50 disabled:opacity-50"
            >
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${selected.color}`}>{selected.icon}</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{selected.label}</span>
                </div>
                <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-primary/20 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in-up">
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { onChange(option.value); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary/10 ${value === option.value ? 'bg-primary/5 font-bold' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${option.color}`}>{option.icon}</span>
                            <span className="text-slate-700 dark:text-slate-200">{option.label}</span>
                            {value === option.value && <span className="material-symbols-outlined text-primary text-[18px] ml-auto">check</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── Main Modal ──────────────────────────────────────────────── */
const CrossPostingModal = ({ isOpen, onClose, onSubmit, onUpdate, onDelete, editTask }) => {
    const isEditMode = !!editTask;

    const [content, setContent] = useState('');
    const [affiliateLink, setAffiliateLink] = useState('https://twincapital.com/ref/aldis');
    const [useAffiliate, setUseAffiliate] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [targetTime, setTargetTime] = useState('');
    const [taskStatus, setTaskStatus] = useState('backlog');

    // AI Generator State
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGenerated, setAiGenerated] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiMediaType, setAiMediaType] = useState('text'); // text | image | video
    const [aiGeneratedMedia, setAiGeneratedMedia] = useState(null); // { type, url, prompt }
    const [attachedMediaList, setAttachedMediaList] = useState([]); // array of { id, type, url, desc }
    const [videoPreview, setVideoPreview] = useState(null); // url of video to preview

    const defaultPlatforms = [
        { id: 'x', name: 'X / Twitter', icon: 'X', color: 'bg-black text-white hover:bg-slate-800', active: true, status: 'idle' },
        { id: 'insta', name: 'Instagram', icon: 'camera_alt', color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white hover:opacity-90', active: true, status: 'idle' },
        { id: 'tiktok', name: 'TikTok', icon: 'music_note', color: 'bg-black text-white hover:bg-slate-800 border border-slate-700', active: true, status: 'idle' },
        { id: 'yt', name: 'YouTube Shorts', icon: 'play_arrow', color: 'bg-red-600 text-white hover:bg-red-700', active: false, status: 'idle' },
        { id: 'linkedin', name: 'LinkedIn', icon: 'work', color: 'bg-[#0077b5] text-white hover:bg-[#006097]', active: false, status: 'idle' },
        { id: 'telegram', name: 'Telegram', icon: 'send', color: 'bg-[#0088cc] text-white hover:bg-[#0070a8]', active: true, status: 'idle' },
    ];
    const [platforms, setPlatforms] = useState(defaultPlatforms);

    // Populate fields when editing
    useEffect(() => {
        if (editTask) {
            setContent(editTask.content || editTask.title || '');
            setTargetTime(editTask.targetTime || '');
            setTaskStatus(editTask.status || 'backlog');
            setUseAffiliate(editTask.useAffiliate || false);
            setAffiliateLink(editTask.affiliateLink || 'https://twincapital.com/ref/aldis');
            // Restore platform states if stored
            if (editTask.platformIds) {
                setPlatforms(defaultPlatforms.map(p => ({ ...p, active: editTask.platformIds.includes(p.id) })));
            }
        } else {
            setContent('');
            setTargetTime('');
            setTaskStatus('backlog');
            setUseAffiliate(false);
            setPlatforms(defaultPlatforms);
        }
    }, [editTask, isOpen]);

    if (!isOpen) return null;

    /* ── AI Content Templates ────────────────────────────── */
    const aiTemplates = [
        (topic) => `🚀 Breaking down ${topic} — here's what most traders get wrong:\n\n1. The market doesn't care about your bias\n2. Risk management > prediction accuracy\n3. Consistency beats intensity\n\nThread below 🧵👇\n\n#Trading #Crypto #${topic.replace(/\s/g, '')}`,
        (topic) => `📊 ${topic} — A Deep Dive\n\nI've been analyzing this for weeks, and here's what the data shows:\n\n✅ Key insight: The trend is shifting\n✅ Volume confirms the move\n✅ Smart money is positioning NOW\n\nDon't sleep on this. Full breakdown 👇\n\n#MarketAnalysis #${topic.replace(/\s/g, '')}`,
        (topic) => `💡 Hot Take: ${topic}\n\nEveryone is talking about this, but nobody is showing the receipts.\n\nHere are 3 charts that tell the REAL story:\n\n📈 Chart 1: Accumulation phase confirmed\n📉 Chart 2: Weak hands shaken out\n📊 Chart 3: Volume spike = institutional entry\n\nBookmark this. Thank me later. 🔥\n\n#TwinCapital #Alpha`,
        (topic) => `🔔 Weekly Signal Alert: ${topic}\n\nOur proprietary algorithm just flagged a high-probability setup.\n\n⏰ Timeframe: 4H\n🎯 Target: +12-18% potential\n⚡ Confidence: HIGH\n\nMembers got early access. Want in?\n\n#SignalAlert #TradingSetup`,
        (topic) => `🎓 ${topic} — Explained Simply\n\nIf you can't explain it to a 5-year-old, you don't understand it well enough.\n\nHere's my attempt:\n\nImagine the market is an ocean. ${topic} is the current beneath the waves. You can't see it, but it moves EVERYTHING.\n\nUnderstanding this = understanding where money flows.\n\nSave this for later 📌`
    ];

    /* ── AI Image Library ──────────────────────────────── */
    const aiImageLibrary = [
        { url: '/ai-media/trading_chart.png', desc: 'Trading chart visualization' },
        { url: '/ai-media/crypto_bull.png', desc: 'Bull run announcement graphic' },
        { url: '/ai-media/market_analysis.png', desc: 'Market analysis infographic' },
        { url: '/ai-media/signal_alert.png', desc: 'Signal alert graphic' },
    ];

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setAiGenerated('');
        setAiGeneratedMedia(null);

        if (aiMediaType === 'text') {
            const template = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
            const fullText = template(aiPrompt.trim());
            for (let i = 0; i <= fullText.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 8 + Math.random() * 12));
                setAiGenerated(fullText.substring(0, i));
            }
        } else if (aiMediaType === 'image') {
            // Simulate image generation with progress
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
            const randomImg = aiImageLibrary[Math.floor(Math.random() * aiImageLibrary.length)];
            setAiGeneratedMedia({ type: 'image', url: randomImg.url, desc: `AI Generated: ${aiPrompt.trim()} — ${randomImg.desc}` });
        } else if (aiMediaType === 'video') {
            // Simulate video generation (longer)
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
            const randomImg = aiImageLibrary[Math.floor(Math.random() * aiImageLibrary.length)];
            setAiGeneratedMedia({ type: 'video', url: randomImg.url, desc: `AI Generated Video: ${aiPrompt.trim()} (15s short)` });
        }
        setIsGenerating(false);
    };

    const acceptAiContent = () => {
        if (aiMediaType === 'text') {
            setContent(aiGenerated);
        }
        if (aiGeneratedMedia) {
            setAttachedMediaList(prev => [...prev, { ...aiGeneratedMedia, id: `m${Date.now()}` }]);
        }
        setShowAiPanel(false);
        setAiGenerated('');
        setAiGeneratedMedia(null);
        setAiPrompt('');
    };

    const discardAiContent = () => {
        setAiGenerated('');
        setAiGeneratedMedia(null);
    };

    const togglePlatform = (id) => {
        if (isPublishing) return;
        setPlatforms(current => current.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const handlePublish = async () => {
        if (!content.trim()) return alert("Please enter some content to publish.");
        const activePlatforms = platforms.filter(p => p.active);
        if (activePlatforms.length === 0) return alert("Select at least one social network.");

        if (taskStatus === 'go_live') {
            setIsPublishing(true);
            setPlatforms(current => current.map(p => ({ ...p, status: 'idle' })));
            for (let i = 0; i < platforms.length; i++) {
                if (platforms[i].active) {
                    setPlatforms(current => current.map((p, idx) => idx === i ? { ...p, status: 'loading' } : p));
                    const delay = Math.floor(Math.random() * 1000) + 500;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    setPlatforms(current => current.map((p, idx) => idx === i ? { ...p, status: 'success' } : p));
                }
            }
            setTimeout(() => { setIsPublishing(false); finalizeSubmit(); }, 1000);
        } else {
            finalizeSubmit();
        }
    };

    const buildTaskData = () => {
        const activePlatforms = platforms.filter(p => p.active);
        return {
            title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
            content: content,
            platform: activePlatforms.length > 1 ? 'Multi-Network' : activePlatforms[0]?.name || 'Unknown',
            platformColor: 'bg-primary/20 text-primary',
            platformIds: activePlatforms.map(p => p.id),
            status: taskStatus,
            targetTime: targetTime,
            useAffiliate: useAffiliate,
            affiliateLink: affiliateLink,
        };
    };

    const finalizeSubmit = () => {
        const taskData = buildTaskData();
        if (isEditMode) {
            onUpdate({ ...taskData, id: editTask.id });
        } else {
            onSubmit(taskData);
        }
        resetAndClose();
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(editTask.id);
        setShowDeleteConfirm(false);
        resetAndClose();
    };

    const resetAndClose = () => {
        setContent('');
        setTargetTime('');
        setUseAffiliate(false);
        setShowDeleteConfirm(false);
        setPlatforms(defaultPlatforms.map(p => ({ ...p, status: 'idle' })));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-md" onClick={!isPublishing ? resetAndClose : undefined}></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-primary/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col xl:flex-row w-full max-w-5xl max-h-[90vh] animate-fade-in-up">

                {/* Left Column: Composer */}
                <div className="flex-1 p-6 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-primary/10 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">{isEditMode ? 'edit_note' : 'edit_square'}</span>
                            {isEditMode ? 'Edit Task' : 'Cross-Posting Studio'}
                        </h3>
                        <div className="flex items-center gap-2">
                            {isEditMode && (
                                <button onClick={handleDelete} disabled={isPublishing} className="text-red-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete Task">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                            <button onClick={resetAndClose} disabled={isPublishing} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Post Time</label>
                            <input
                                type="datetime-local"
                                value={targetTime}
                                onChange={(e) => setTargetTime(e.target.value)}
                                disabled={isPublishing}
                                className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Status</label>
                            <CustomSelect value={taskStatus} onChange={setTaskStatus} disabled={isPublishing} />
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 gap-4">
                        <div className="relative flex-1 min-h-[160px]">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isPublishing}
                                placeholder="Share an insights, signal, or portfolio update..."
                                className="w-full h-full min-h-[160px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 resize-y focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono">
                                {content.length} chars
                            </div>
                        </div>

                        {/* ── Attached Media Gallery ──────────── */}
                        {attachedMediaList.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Media ({attachedMediaList.length})</span>
                                    <button onClick={() => setAttachedMediaList([])} className="text-[10px] text-red-400 hover:text-red-500 font-bold transition-colors">Clear All</button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {attachedMediaList.map((media) => (
                                        <div key={media.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group aspect-square">
                                            <img src={media.url} alt={media.desc} className="w-full h-full object-cover" />
                                            {media.type === 'video' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setVideoPreview(media); }}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                        <span className="material-symbols-outlined text-slate-800 text-xl ml-0.5">play_arrow</span>
                                                    </div>
                                                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">0:15</span>
                                                </button>
                                            )}
                                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                {media.type === 'video' ? '🎬' : '🖼️'}
                                            </div>
                                            <button
                                                onClick={() => setAttachedMediaList(prev => prev.filter(m => m.id !== media.id))}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── AI Content Generator ────────────── */}
                        <div className="border border-purple-500/20 rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowAiPanel(!showAiPanel)}
                                disabled={isPublishing}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/5 via-primary/5 to-blue-500/5 hover:from-purple-500/10 hover:via-primary/10 hover:to-blue-500/10 transition-all disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400 text-[20px]">auto_awesome</span>
                                    <span className="text-sm font-bold text-purple-400">Generate Content with AI</span>
                                </div>
                                <span className={`material-symbols-outlined text-purple-400 text-[18px] transition-transform ${showAiPanel ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {showAiPanel && (
                                <div className="p-4 space-y-3 border-t border-purple-500/10 bg-purple-500/[0.02]">
                                    {/* Media Type Tabs */}
                                    <div className="flex gap-1 bg-slate-100 dark:bg-black/30 rounded-lg p-1">
                                        {[
                                            { id: 'text', label: 'Text', icon: 'article' },
                                            { id: 'image', label: 'Image', icon: 'image' },
                                            { id: 'video', label: 'Video', icon: 'movie' },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => { setAiMediaType(tab.id); setAiGenerated(''); setAiGeneratedMedia(null); }}
                                                disabled={isGenerating}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all ${aiMediaType === tab.id ? 'bg-white dark:bg-slate-800 text-purple-500 shadow-sm' : 'text-slate-500 hover:text-purple-400'}`}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Prompt Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleAiGenerate()}
                                            disabled={isGenerating}
                                            placeholder={aiMediaType === 'text' ? "Describe your topic, e.g. 'Bitcoin breakout analysis'..." : aiMediaType === 'image' ? "Describe the image, e.g. 'bullish crypto chart'..." : "Describe the video, e.g. 'market recap short'..."}
                                            className="flex-1 bg-slate-50 dark:bg-black/30 border border-purple-500/20 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/30 outline-none placeholder:text-slate-500 disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleAiGenerate}
                                            disabled={isGenerating || !aiPrompt.trim()}
                                            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                                        >
                                            {isGenerating ? (
                                                <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>{aiMediaType === 'text' ? 'Writing...' : 'Creating...'}</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[16px]">auto_awesome</span>Generate</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Generation Progress for Media */}
                                    {isGenerating && aiMediaType !== 'text' && (
                                        <div className="bg-white dark:bg-slate-800/80 border border-purple-500/20 rounded-xl p-6 flex flex-col items-center gap-3">
                                            <div className="relative w-20 h-20">
                                                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                                                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-purple-400 text-2xl">{aiMediaType === 'image' ? 'image' : 'movie'}</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-purple-400">Generating {aiMediaType === 'image' ? 'Image' : 'Video'}...</p>
                                                <p className="text-[10px] text-slate-500 mt-1">AI is creating your {aiMediaType} based on "{aiPrompt}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Text AI Preview */}
                                    {aiMediaType === 'text' && (aiGenerated || isGenerating) && (
                                        <div className="relative">
                                            <div className="bg-white dark:bg-slate-800/80 border border-purple-500/20 rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-purple-400 text-[16px]">auto_awesome</span>
                                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Preview</span>
                                                    </div>
                                                    {isGenerating && <span className="text-[10px] text-purple-400 font-mono animate-pulse">typing...</span>}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed text-slate-700 dark:text-slate-200 min-h-[60px]">
                                                    {aiGenerated}
                                                    {isGenerating && <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-text-bottom"></span>}
                                                </div>

                                                {/* Accept / Discard / Regenerate Buttons */}
                                                {!isGenerating && aiGenerated && (
                                                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                        <button onClick={acceptAiContent} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                            Use This Content
                                                        </button>
                                                        <button onClick={handleAiGenerate} className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors">
                                                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                                                            Retry
                                                        </button>
                                                        <button onClick={discardAiContent} className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                                            Discard
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image / Video AI Preview */}
                                    {aiMediaType !== 'text' && aiGeneratedMedia && !isGenerating && (
                                        <div className="bg-white dark:bg-slate-800/80 border border-purple-500/20 rounded-xl overflow-hidden space-y-0">
                                            <div className="flex items-center justify-between px-4 pt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-purple-400 text-[16px]">auto_awesome</span>
                                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI {aiGeneratedMedia.type} Preview</span>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="relative rounded-lg overflow-hidden">
                                                    <img src={aiGeneratedMedia.url} alt={aiGeneratedMedia.desc} className="w-full h-52 object-cover" />
                                                    {aiGeneratedMedia.type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                                                                <span className="material-symbols-outlined text-slate-800 text-3xl ml-0.5">play_arrow</span>
                                                            </div>
                                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">0:15</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 italic">{aiGeneratedMedia.desc}</p>
                                            </div>
                                            <div className="flex gap-2 p-3 pt-0">
                                                <button onClick={acceptAiContent} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                                    Use This {aiGeneratedMedia.type === 'video' ? 'Video' : 'Image'}
                                                </button>
                                                <button onClick={handleAiGenerate} className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                                                    Retry
                                                </button>
                                                <button onClick={discardAiContent} className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <button disabled={isPublishing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined text-[18px]">imagesmode</span>
                                Attach Media
                            </button>

                            <div className="flex-1 w-full bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="affiliateToggleModal"
                                        checked={useAffiliate}
                                        onChange={() => setUseAffiliate(!useAffiliate)}
                                        disabled={isPublishing}
                                        className="rounded border-primary/30 text-primary focus:ring-primary/50 w-4 h-4"
                                    />
                                    <label htmlFor="affiliateToggleModal" className="text-sm font-semibold cursor-pointer">Inject Affiliate Tag</label>
                                </div>
                                <input
                                    type="text"
                                    value={affiliateLink}
                                    onChange={(e) => setAffiliateLink(e.target.value)}
                                    disabled={!useAffiliate || isPublishing}
                                    className="bg-transparent border-b border-primary/30 text-xs font-mono text-primary outline-none focus:border-primary w-full sm:w-48 disabled:opacity-30 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {useAffiliate && content && (
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 font-mono whitespace-pre-wrap break-words mt-2">
                                <strong className="text-slate-700 dark:text-slate-300">Preview:</strong><br />
                                {content}
                                <br /><br />
                                🚀 Join my inner circle: <span className="text-primary">{affiliateLink}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Platform Selection & Execution */}
                <div className="w-full xl:w-[350px] bg-slate-50 dark:bg-slate-800/30 p-6 flex flex-col border-t xl:border-t-0 border-slate-200 dark:border-slate-800 overflow-y-auto">
                    <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Target Audience Networks</h4>

                    <div className="flex-1 flex flex-col gap-3">
                        {platforms.map(platform => (
                            <div
                                key={platform.id}
                                onClick={() => togglePlatform(platform.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${platform.active ? 'border-primary/50 bg-white dark:bg-background-dark shadow-sm' : 'border-slate-200 dark:border-slate-700/50 opacity-60 hover:opacity-100'} ${isPublishing ? 'pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${platform.color}`}>
                                        {platform.icon === 'X' ? '𝕏' : <span className="material-symbols-outlined text-[16px]">{platform.icon}</span>}
                                    </div>
                                    <span className={`text-sm font-bold ${platform.active ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{platform.name}</span>
                                </div>

                                <div className="ml-auto flex items-center">
                                    {platform.status === 'idle' && (
                                        <div className={`w-10 h-5 rounded-full transition-colors relative ${platform.active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${platform.active ? 'right-0.5' : 'left-0.5'}`}></div>
                                        </div>
                                    )}
                                    {platform.status === 'loading' && (
                                        <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                                    )}
                                    {platform.status === 'success' && (
                                        <span className="material-symbols-outlined text-emerald-500 font-bold">check_circle</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !platforms.some(p => p.active) || !content.trim()}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isPublishing ? 'bg-primary/50 text-background-dark/80 cursor-not-allowed' : 'bg-primary text-background-dark hover:shadow-primary/20 hover:-translate-y-0.5'}`}
                        >
                            {isPublishing ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                    Broadcasting...
                                </>
                            ) : (
                                <>
                                    {taskStatus === 'go_live' ? (
                                        <><span className="material-symbols-outlined text-[20px]">rocket_launch</span> Publish to {platforms.filter(p => p.active).length} Networks</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[20px]">save</span> {isEditMode ? 'Update' : 'Save to'} {statusOptions.find(o => o.value === taskStatus)?.label}</>
                                    )}
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            OAuth 2.0 Secure Channel
                        </p>
                    </div>
                </div>

                {/* ── Delete Confirmation Overlay ─────────────── */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-background-dark/70 backdrop-blur-sm rounded-2xl">
                        <div className="bg-white dark:bg-slate-900 border border-red-500/20 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-fade-in-up">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Delete this task?</h3>
                            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The task will be permanently removed from your pipeline.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors shadow-lg hover:shadow-red-500/20">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Video Player Overlay ───────────────────── */}
                {videoPreview && (
                    <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md rounded-2xl">
                        <div className="w-full max-w-lg mx-4 space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-white text-xl">movie</span>
                                    <span className="text-white text-sm font-bold">Video Preview</span>
                                </div>
                                <button onClick={() => setVideoPreview(null)} className="text-white/60 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                                <img src={videoPreview.url} alt="Video preview" className="w-full aspect-video object-cover" />
                                <VideoPlayerOverlay />
                            </div>
                            <p className="text-white/50 text-xs text-center italic">{videoPreview.desc}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrossPostingModal;
