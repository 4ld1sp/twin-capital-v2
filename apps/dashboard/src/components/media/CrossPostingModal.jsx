import React, { useState, useEffect, useRef } from 'react';
import { useApp, availablePlatforms } from '../../context/AppContext';

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
                className="w-full flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-left transition-all hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
            >
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${selected.color}`}>{selected.icon}</span>
                    <span className="text-main font-bold">{selected.label}</span>
                </div>
                <span className={`material-symbols-outlined text-secondary text-[18px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-glass/95 backdrop-blur-3xl border border-glass rounded-2xl shadow-2xl z-[60] overflow-hidden animate-fade-in-up">
                    {statusOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => { onChange(option.value); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all hover:bg-primary hover:text-black ${value === option.value ? 'bg-primary/10 font-black' : 'text-main'}`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${option.color}`}>{option.icon}</span>
                            <span className="flex-1 text-left">{option.label}</span>
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
    const fileInputRef = useRef(null);
    const [videoPreview, setVideoPreview] = useState(null); // url of video to preview

    const { userConnections } = useApp();
    
    // Map connections to platform format
    const getSocialPlatforms = () => {
        return (userConnections.social || []).map(conn => {
            const platformDef = availablePlatforms.social.find(p => p.id === conn.platformId) || 
                               availablePlatforms.social.find(p => p.id === 'other');
            
            return {
                id: conn.id,
                name: conn.name,
                icon: platformDef.icon,
                color: platformDef.color,
                active: conn.connected, // Only active if connected
                connected: conn.connected,
                status: 'idle'
            };
        });
    };

    const [platforms, setPlatforms] = useState([]);

    // Sync platforms when userConnections or modal opens changes
    useEffect(() => {
        if (isOpen) {
            setPlatforms(getSocialPlatforms());
        }
    }, [userConnections.social, isOpen]);

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
                setPlatforms(prev => prev.map(p => ({ ...p, active: editTask.platformIds.includes(p.id) })));
            }
            if (editTask.media) {
                setAttachedMediaList(editTask.media);
            }
        } else {
            setContent('');
            setTargetTime('');
            setTaskStatus('backlog');
            setUseAffiliate(false);
            setAttachedMediaList([]);
            setPlatforms(getSocialPlatforms());
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
        setPlatforms(current => current.map(p => {
            if (p.id === id) {
                if (!p.connected) return p; // Cannot toggle if not connected
                return { ...p, active: !p.active };
            }
            return p;
        }));
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
            media: attachedMediaList,
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

    const handleMediaUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newMedia = files.map(file => ({
            id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: URL.createObjectURL(file),
            desc: file.name
        }));

        setAttachedMediaList(prev => [...prev, ...newMedia]);
        // Reset input so discovery works for same file if deleted
        e.target.value = '';
    };

    const resetAndClose = () => {
        setContent('');
        setTargetTime('');
        setUseAffiliate(false);
        setShowDeleteConfirm(false);
        setPlatforms(getSocialPlatforms());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={!isPublishing ? resetAndClose : undefined}></div>

            {/* Modal Content */}
            <div className="relative glass-card border border-glass rounded-3xl shadow-2xl overflow-hidden flex flex-col xl:flex-row w-full max-w-5xl max-h-[90vh] animate-fade-in-up transition-all duration-300">

                {/* Left Column: Composer */}
                <div className="flex-1 p-6 md:p-8 border-b xl:border-b-0 xl:border-r border-glass flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-2xl flex items-center gap-2 text-main">
                            <span className="material-symbols-outlined text-primary text-3xl">{isEditMode ? 'edit_note' : 'edit_square'}</span>
                            {isEditMode ? 'Edit Task' : 'Cross-Posting Studio'}
                        </h3>
                        <div className="flex items-center gap-3">
                            {isEditMode && (
                                <button onClick={handleDelete} disabled={isPublishing} className="w-10 h-10 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50" title="Delete Task">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            )}
                            <button onClick={resetAndClose} disabled={isPublishing} className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">Target Post Time</label>
                            <input
                                type="datetime-local"
                                value={targetTime}
                                onChange={(e) => setTargetTime(e.target.value)}
                                disabled={isPublishing}
                                className="bg-black/5 dark:bg-white/5 border border-glass rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-main font-bold transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-secondary uppercase tracking-widest pl-1">Pipeline Status</label>
                            <CustomSelect value={taskStatus} onChange={setTaskStatus} disabled={isPublishing} />
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 gap-6">
                        <div className="relative flex-1 min-h-[200px]">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isPublishing}
                                placeholder="Share an insights, signal, or portfolio update..."
                                className="w-full h-full min-h-[200px] bg-black/5 dark:bg-white/5 border border-glass rounded-2xl p-6 resize-y focus:ring-2 focus:ring-primary/50 text-base text-main placeholder:text-secondary disabled:opacity-50 transition-all font-medium"
                            />
                            <div className="absolute bottom-4 right-4 text-[10px] text-secondary font-black bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg border border-glass">
                                {content.length} CHARS
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
                        <div className="glass-card border border-purple-500/30 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10">
                            <button
                                type="button"
                                onClick={() => setShowAiPanel(!showAiPanel)}
                                disabled={isPublishing}
                                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500/[0.05] via-primary/[0.05] to-blue-500/[0.05] hover:from-purple-500/[0.1] hover:via-primary/[0.1] hover:to-blue-500/[0.1] transition-all disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-purple-400 text-[24px]">auto_awesome</span>
                                    <span className="text-sm font-black text-purple-400 uppercase tracking-widest">AI CONTENT STUDIO</span>
                                </div>
                                <span className={`material-symbols-outlined text-purple-400 text-[20px] transition-transform ${showAiPanel ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {showAiPanel && (
                                <div className="p-6 space-y-6 border-t border-purple-500/20 bg-purple-500/[0.02]">
                                    {/* Media Type Tabs */}
                                    <div className="flex gap-2 bg-black/10 dark:bg-white/10 rounded-xl p-1.5 border border-glass">
                                        {[
                                            { id: 'text', label: 'Draft', icon: 'article' },
                                            { id: 'image', label: 'Image', icon: 'image' },
                                            { id: 'video', label: 'Video', icon: 'movie' },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => { setAiMediaType(tab.id); setAiGenerated(''); setAiGeneratedMedia(null); }}
                                                disabled={isGenerating}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aiMediaType === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-secondary hover:text-main'}`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Prompt Input */}
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleAiGenerate()}
                                            disabled={isGenerating}
                                            placeholder={aiMediaType === 'text' ? "Describe your topic, e.g. 'Bitcoin breakout analysis'..." : aiMediaType === 'image' ? "Describe the image, e.g. 'bullish crypto chart'..." : "Describe the video, e.g. 'market recap short'..."}
                                            className="flex-1 bg-black/5 dark:bg-white/5 border border-purple-500/30 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none text-main placeholder:text-secondary disabled:opacity-50 font-medium"
                                        />
                                        <button
                                            onClick={handleAiGenerate}
                                            disabled={isGenerating || !aiPrompt.trim()}
                                            className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
                                        >
                                            {isGenerating ? (
                                                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>{aiMediaType === 'text' ? 'WRITING...' : 'BUILDING...'}</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[18px]">auto_awesome</span>GO</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Generation Progress for Media */}
                                    {isGenerating && aiMediaType !== 'text' && (
                                        <div className="bg-black/10 dark:bg-white/10 border border-purple-500/30 rounded-2xl p-8 flex flex-col items-center gap-4">
                                            <div className="relative w-24 h-24">
                                                <div className="absolute inset-0 rounded-full border-4 border-glass"></div>
                                                <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-purple-400 text-3xl">{aiMediaType === 'image' ? 'image' : 'movie'}</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-purple-400 uppercase tracking-widest leading-relaxed">Synthesizing {aiMediaType === 'image' ? 'Image' : 'Video'}</p>
                                                <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-wider">Dreaming up your {aiMediaType}...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Text AI Preview */}
                                    {aiMediaType === 'text' && (aiGenerated || isGenerating) && (
                                        <div className="relative">
                                            <div className="bg-black/10 dark:bg-white/10 border border-purple-500/30 rounded-2xl p-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-purple-400 text-[18px]">auto_awesome</span>
                                                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI Preview</span>
                                                    </div>
                                                    {isGenerating && <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest animate-pulse">typing...</span>}
                                                </div>
                                                <div className="text-sm text-main whitespace-pre-wrap break-words leading-relaxed min-h-[80px] font-medium">
                                                    {aiGenerated}
                                                    {isGenerating && <span className="inline-block w-1 h-4 bg-purple-400 animate-pulse ml-0.5 align-text-bottom"></span>}
                                                </div>

                                                {/* Accept / Discard / Regenerate Buttons */}
                                                {!isGenerating && aiGenerated && (
                                                    <div className="flex gap-3 pt-4 border-t border-glass">
                                                        <button onClick={acceptAiContent} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
                                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                                            Use Draft
                                                        </button>
                                                        <button onClick={handleAiGenerate} className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest border border-purple-500/30 hover:bg-purple-500/20 transition-all">
                                                            <span className="material-symbols-outlined text-[16px]">refresh</span>
                                                        </button>
                                                        <button onClick={discardAiContent} className="flex items-center justify-center gap-2 px-4 py-3 bg-black/10 dark:bg-white/10 text-secondary rounded-xl text-xs font-black uppercase tracking-widest border border-glass hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image / Video AI Preview */}
                                    {aiMediaType !== 'text' && aiGeneratedMedia && !isGenerating && (
                                        <div className="bg-black/10 dark:bg-white/10 border border-purple-500/30 rounded-2xl overflow-hidden shadow-xl">
                                            <div className="flex items-center justify-between px-6 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-purple-400 text-[18px]">auto_awesome</span>
                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI {aiGeneratedMedia.type} Preview</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="relative rounded-xl overflow-hidden border border-glass shadow-2xl group">
                                                    <img src={aiGeneratedMedia.url} alt={aiGeneratedMedia.desc} className="w-full h-64 object-cover" />
                                                    {aiGeneratedMedia.type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                                                                <span className="material-symbols-outlined text-slate-800 text-3xl ml-1">play_arrow</span>
                                                            </div>
                                                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">0:15</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-secondary font-bold mt-4 italic uppercase tracking-wider">{aiGeneratedMedia.desc}</p>
                                            </div>
                                            <div className="flex gap-3 p-4 pt-0">
                                                <button onClick={acceptAiContent} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                    Use Result
                                                </button>
                                                <button onClick={handleAiGenerate} className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest border border-purple-500/30 hover:bg-purple-500/20 transition-all">
                                                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                                                </button>
                                                <button onClick={discardAiContent} className="flex items-center justify-center gap-2 px-4 py-3 bg-black/10 dark:bg-white/10 text-secondary rounded-xl text-xs font-black uppercase tracking-widest border border-glass hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleMediaUpload} 
                                className="hidden" 
                                accept="image/*,video/*" 
                                multiple
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPublishing} 
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-glass disabled:opacity-50 text-main font-bold"
                            >
                                <span className="material-symbols-outlined text-[20px]">imagesmode</span>
                                Attach Media
                            </button>

                            <div className="flex-1 w-full bg-primary/5 border border-primary/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="affiliateToggleModal"
                                        checked={useAffiliate}
                                        onChange={() => setUseAffiliate(!useAffiliate)}
                                        disabled={isPublishing}
                                        className="rounded-full border-primary/30 text-primary focus:ring-primary/50 w-5 h-5 transition-all"
                                    />
                                    <label htmlFor="affiliateToggleModal" className="text-xs font-black uppercase tracking-widest cursor-pointer text-main">Affiliate Tag</label>
                                </div>
                                <input
                                    type="text"
                                    value={affiliateLink}
                                    onChange={(e) => setAffiliateLink(e.target.value)}
                                    disabled={!useAffiliate || isPublishing}
                                    className="bg-transparent border-b border-primary/50 text-xs font-mono text-primary outline-none focus:border-primary w-full sm:w-48 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
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
                <div className="w-full xl:w-[350px] bg-black/5 dark:bg-white/[0.02] p-6 md:p-8 flex flex-col border-t xl:border-t-0 border-glass overflow-y-auto">
                    <h4 className="font-black text-[10px] text-secondary uppercase tracking-widest mb-6 pl-1">TARGET AUDIENCE NETWORKS</h4>

                    <div className="flex-1 flex flex-col gap-4">
                        {platforms.map(platform => (
                            <div
                                key={platform.id}
                                onClick={() => togglePlatform(platform.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${platform.active ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5 opacity-100' : 'border-glass opacity-40 hover:opacity-70'} ${!platform.connected ? 'cursor-not-allowed grayscale' : 'hover:bg-black/5 dark:hover:bg-white/5'} ${isPublishing ? 'pointer-events-none' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${platform.color}`}>
                                        {platform.icon === 'X' ? '𝕏' : <span className="material-symbols-outlined text-[18px]">{platform.icon}</span>}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-widest ${platform.active ? 'text-main' : 'text-secondary font-bold'}`}>
                                        {platform.name}
                                        {!platform.connected && <span className="block text-[8px] text-rose-500 mt-0.5">Disconnected</span>}
                                    </span>
                                </div>

                                <div className="ml-auto flex items-center">
                                    {platform.status === 'idle' && (
                                        <div className={`w-11 h-6 rounded-full transition-all relative p-1 ${platform.active ? 'bg-primary' : 'bg-black/20 dark:bg-white/20'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${platform.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </div>
                                    )}
                                    {platform.status === 'loading' && (
                                        <span className="material-symbols-outlined text-primary animate-spin text-[20px]">progress_activity</span>
                                    )}
                                    {platform.status === 'success' && (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-500 font-black text-[18px]">check</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-glass">
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !platforms.some(p => p.active) || !content.trim()}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${isPublishing ? 'bg-primary/50 text-black/50 cursor-not-allowed' : 'bg-primary text-black hover:shadow-primary/30 hover:-translate-y-1 active:scale-95'}`}
                        >
                            {isPublishing ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
                                    BROADCASTING...
                                </>
                            ) : (
                                <>
                                    {taskStatus === 'go_live' ? (
                                        <><span className="material-symbols-outlined text-[22px]">rocket_launch</span> PUBLISH NOW</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-[22px]">save</span> {isEditMode ? 'UPDATE' : 'SAVE TO'} {statusOptions.find(o => o.value === taskStatus)?.label.toUpperCase()}</>
                                    )}
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-secondary font-black uppercase tracking-widest mt-5 flex items-center justify-center gap-1.5 opacity-60">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            OAUTH 2.0 SECURE CHANNEL
                        </p>
                    </div>
                </div>

                {/* ── Delete Confirmation Overlay ─────────────── */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md">
                        <div className="glass-card border border-rose-500/30 rounded-3xl p-10 shadow-3xl max-w-sm w-full mx-4 text-center animate-fade-in-up">
                            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-rose-500 text-4xl">delete_forever</span>
                            </div>
                            <h3 className="text-xl font-black mb-3 text-main uppercase tracking-widest">Delete this task?</h3>
                            <p className="text-sm text-secondary font-bold mb-8 uppercase tracking-wider leading-relaxed">This action cannot be undone. The task will be vanished from your pipeline.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3.5 rounded-2xl border border-glass font-black text-[10px] uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-all text-main">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20">Purge Task</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Video Player Overlay ───────────────────── */}
                {videoPreview && (
                    <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                        <div className="w-full max-w-2xl mx-6 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-2xl">movie</span>
                                    <span className="text-white text-sm font-black uppercase tracking-widest">Master Video Preview</span>
                                </div>
                                <button onClick={() => setVideoPreview(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-3xl">
                                <img src={videoPreview.url} alt="Video preview" className="w-full aspect-video object-cover opacity-80" />
                                <VideoPlayerOverlay />
                            </div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center italic">{videoPreview.desc}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrossPostingModal;
