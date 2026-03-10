export default function ActivityLog({ items }) {
  return (
    <div className="activity-log">
      {items.map(item => (
        <div key={item.id} className="activity-item">
          <div className={`activity-icon activity-icon--${item.type}`}>
            {item.icon}
          </div>
          <div className="activity-content">
            <div className="activity-title">{item.title}</div>
            <div className="activity-desc">{item.desc}</div>
          </div>
          <div className="activity-time">{item.time}</div>
        </div>
      ))}
    </div>
  )
}
