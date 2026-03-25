import React, { useState, useEffect } from 'react';
import CrossPostingModal from './CrossPostingModal';

const initialTasks = [
  { id: 't1', title: 'Q4 Strategy Video Script', content: 'Q4 Strategy Video Script', platform: 'YouTube', platformColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', status: 'backlog', targetTime: '2026-10-15T14:00', platformIds: ['yt'] },
  { id: 't2', title: 'Market Volatility Thread', content: 'Market Volatility Thread', platform: 'Twitter', platformColor: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', status: 'backlog', targetTime: '2026-10-14T09:00', platformIds: ['x'] },
  { id: 't3', title: 'Founder Interview Edit', content: 'Founder Interview Edit', platform: 'LinkedIn', platformColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', status: 'in_progress', platformIds: ['linkedin'] },
  { id: 't4', title: 'October Newsletter Draft', content: 'October Newsletter Draft', platform: 'Email', platformColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300', status: 'review', platformIds: [] },
  { id: 't5', title: 'Weekly Market Recap', content: 'Weekly Market Recap', platform: 'Blog', platformColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300', status: 'review', platformIds: [] },
  { id: 't6', title: 'New Trading Engine Teaser', content: 'New Trading Engine Teaser', platform: 'Twitter', platformColor: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', status: 'go_live', platformIds: ['x', 'telegram'] },
];

const ContentPipeline = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const columns = [
    { id: 'backlog', title: 'Backlog', titleColor: 'text-slate-500', badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-500' },
    { id: 'in_progress', title: 'In Progress', titleColor: 'text-primary', badgeClass: 'bg-primary/20 text-primary', borderHighlight: 'border-l-4 border-l-primary' },
    { id: 'review', title: 'Review', titleColor: 'text-amber-500', badgeClass: 'bg-amber-500/20 text-amber-500', borderHighlight: 'border-l-4 border-l-amber-500' },
    { id: 'go_live', title: 'Go Live', titleColor: 'text-emerald-500', badgeClass: 'bg-emerald-500/20 text-emerald-500', borderHighlight: 'border-l-4 border-l-emerald-500' }
  ];

  /* ── Auto-Pilot Timer ──────────────────────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(currentTasks =>
        currentTasks.map(task => {
          if (task.status !== 'go_live' && task.targetTime) {
            const target = new Date(task.targetTime);
            if (now >= target) {
              return { ...task, status: 'go_live' };
            }
          }
          return task;
        })
      );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  /* ── Drag & Drop ───────────────────────────────────────────── */
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };
  const handleDragEnd = (e) => { e.target.style.opacity = '1'; setDraggedTaskId(null); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(cur => cur.map(t => t.id === draggedTaskId ? { ...t, status: columnId } : t));
    }
  };

  /* ── CRUD Handlers ─────────────────────────────────────────── */
  const handleCreate = (data) => { setTasks(cur => [{ id: `t${Date.now()}`, ...data }, ...cur]); };
  const handleUpdate = (data) => { setTasks(cur => cur.map(t => t.id === data.id ? { ...t, ...data } : t)); };
  const handleDelete = (id) => { setTasks(cur => cur.filter(t => t.id !== id)); };

  const openCreateModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const openEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  /* ── Helper: is target time overdue? ───────────────────────── */
  const isOverdue = (targetTime) => {
    if (!targetTime) return false;
    return new Date() > new Date(targetTime);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-main">Content Pipeline</h3>
        <button onClick={openCreateModal} className="flex items-center gap-1.5 text-xs font-black text-black bg-primary hover:brightness-110 transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-glass flex flex-col transition-all min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${column.titleColor}`}>{column.title}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${column.badgeClass}`}>{columnTasks.length}</span>
              </div>

              {/* Task List */}
              <div className="space-y-3 flex-1 flex flex-col">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openEditModal(task)}
                    className={`glass-card p-4 rounded-xl shadow-sm border border-glass cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all group ${column.borderHighlight || ''} ${draggedTaskId === task.id ? 'ring-2 ring-primary border-transparent opacity-50 relative z-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-main flex-1 pr-2 leading-tight">{task.title}</p>
                      <span className="material-symbols-outlined text-[16px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                    </div>

                    {task.targetTime && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-3 p-1.5 rounded-lg border ${isOverdue(task.targetTime) && task.status !== 'go_live' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-black/5 dark:bg-white/5 text-secondary border-glass'}`}>
                        <span className="material-symbols-outlined text-[14px]">{isOverdue(task.targetTime) && task.status !== 'go_live' ? 'warning' : 'schedule'}</span>
                        {new Date(task.targetTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}

                    {task.media && task.media.length > 0 && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-glass relative aspect-video bg-black/5 dark:bg-white/5 group-hover:border-primary/30 transition-all">
                        {task.media[0].type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <img src={task.media[0].url} alt="" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-all">
                              <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg">play_circle</span>
                            </div>
                          </div>
                        ) : (
                          <img src={task.media[0].url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        )}
                        {task.media.length > 1 && (
                          <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/10 shadow-lg">
                            +{task.media.length - 1} MEDIA
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-glass shadow-sm ${task.platformColor}`}>{task.platform}</span>
                      <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-black shadow-sm">A</div>
                    </div>
                  </div>
                ))}

                {draggedTaskId && columnTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center pointer-events-none transition-all">
                    <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest">Drop Here</span>
                  </div>
                )}
                {columnTasks.length === 0 && !draggedTaskId && (
                  <div className="text-secondary opacity-40 text-[10px] font-black uppercase tracking-widest text-center py-12 border-2 border-dashed border-glass rounded-2xl flex-1 flex items-center justify-center">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CrossPostingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        editTask={editingTask}
      />
    </div>
  );
};

export default ContentPipeline;
