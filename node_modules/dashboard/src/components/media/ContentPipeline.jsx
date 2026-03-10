import React, { useState } from 'react';

const initialTasks = [
  { id: 't1', title: 'Q4 Strategy Video Script', platform: 'YouTube', platformColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', status: 'backlog' },
  { id: 't2', title: 'Market Volatility Thread', platform: 'Twitter', platformColor: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', status: 'backlog' },
  { id: 't3', title: 'Founder Interview Edit', platform: 'LinkedIn', platformColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', status: 'in_progress' },
  { id: 't4', title: 'October Newsletter Draft', platform: 'Email', platformColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300', status: 'review' },
  { id: 't5', title: 'Weekly Market Recap', platform: 'Blog', platformColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300', status: 'review' },
  { id: 't6', title: 'New Trading Engine Teaser', platform: 'Twitter', platformColor: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', status: 'go_live' },
];

const ContentPipeline = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Define board columns
  const columns = [
    { id: 'backlog', title: 'Backlog', titleColor: 'text-slate-500', badgeClass: 'bg-slate-200 dark:bg-slate-800 text-slate-500' },
    { id: 'in_progress', title: 'In Progress', titleColor: 'text-primary', badgeClass: 'bg-primary/20 text-primary', borderHighlight: 'border-l-4 border-l-primary' },
    { id: 'review', title: 'Review', titleColor: 'text-amber-500', badgeClass: 'bg-amber-500/20 text-amber-500', borderHighlight: 'border-l-4 border-l-amber-500' },
    { id: 'go_live', title: 'Go Live', titleColor: 'text-emerald-500', badgeClass: 'bg-emerald-500/20 text-emerald-500', borderHighlight: 'border-l-4 border-l-emerald-500' }
  ];

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    // Optional: Setting visual drag image or data format
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to be set for drag to work
    e.dataTransfer.setData('text/plain', taskId);

    // Slight delay so the element doesn't disappear immediately from under the cursor
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === draggedTaskId ? { ...task, status: columnId } : task
        )
      );
    }
  };

  // Filter tasks per column
  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="xl:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Content Pipeline</h3>
        <button className="text-sm font-medium text-primary hover:underline transition-colors px-3 py-1 rounded-lg hover:bg-primary/10">+ Add Task</button>
      </div>

      {/* Dynamic 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div
              key={column.id}
              className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col transition-colors min-h-[300px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${column.titleColor}`}>{column.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${column.badgeClass}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Task List */}
              <div className="space-y-3 flex-1 flex flex-col">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform ${column.borderHighlight || ''} ${draggedTaskId === task.id ? 'ring-2 ring-primary border-transparent opacity-50 relative z-50' : ''}`}
                  >
                    <p className="text-sm font-medium mb-2">{task.title}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.platformColor}`}>
                        {task.platform}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                        A {/* Author Initial Placeholder */}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Visual affordance for empty columns during drag */}
                {draggedTaskId && columnTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center pointer-events-none transition-all">
                    <span className="text-primary/40 text-xs font-bold uppercase tracking-wider">Drop Here</span>
                  </div>
                )}

                {columnTasks.length === 0 && !draggedTaskId && (
                  <div className="text-slate-400 dark:text-slate-600 text-xs text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex-1 flex items-center justify-center">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentPipeline;
