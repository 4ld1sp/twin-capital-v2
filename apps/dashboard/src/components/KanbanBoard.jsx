export default function KanbanBoard({ pipeline }) {
  const columns = [
    { key: 'generated', label: 'Generated', color: 'var(--accent-cyan)' },
    { key: 'repurposed', label: 'Repurposed', color: 'var(--accent-amber)' },
    { key: 'scheduled', label: 'Scheduled', color: 'var(--accent-purple)' },
    { key: 'published', label: 'Published', color: 'var(--accent-teal)' },
  ]

  return (
    <div className="kanban">
      {columns.map(col => (
        <div key={col.key} className="kanban-column">
          <div className="kanban-column-header" style={{ borderBottomColor: col.color }}>
            <span>{col.label}</span>
            <span className="kanban-count">{pipeline[col.key]?.length || 0}</span>
          </div>
          {pipeline[col.key]?.map(item => (
            <div key={item.id} className="kanban-card">
              <div className="kanban-card-title">{item.title}</div>
              <div className="kanban-card-meta">
                {item.platform} · {item.format}
                {item.engagement != null && <span> · {item.engagement}% eng.</span>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
