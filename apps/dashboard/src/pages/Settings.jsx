import { useState } from 'react'
import AllocationSlider from '../components/AllocationSlider'
import { defaultSettings } from '../data/mock'
import { Eye, EyeOff, Save, RotateCcw } from 'lucide-react'

export default function Settings() {
  const [allocation, setAllocation] = useState({ ...defaultSettings.allocation })
  const [risk, setRisk] = useState({ ...defaultSettings.risk })
  const [notifications, setNotifications] = useState({ ...defaultSettings.notifications })
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setAllocation({ ...defaultSettings.allocation })
    setRisk({ ...defaultSettings.risk })
    setNotifications({ ...defaultSettings.notifications })
  }

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const notifLabels = {
    drawdownAlert: 'Drawdown Alert',
    rebalancingComplete: 'Rebalancing Complete',
    targetAchieved: 'Target Achieved',
    dailySummary: 'Daily Summary Email',
    botStatusChanges: 'Bot Status Changes',
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Capital Allocation */}
      <div className="section">
        <AllocationSlider allocation={allocation} onChange={setAllocation} />
      </div>

      {/* Risk + Notifications */}
      <div className="grid-1-1 section">
        <div className="card">
          <h3 className="section-title">Risk Parameters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="input-group">
              <label className="input-label">Max Drawdown (%)</label>
              <input
                type="number"
                className="input"
                value={risk.maxDrawdown}
                onChange={e => setRisk(prev => ({ ...prev, maxDrawdown: parseInt(e.target.value) || 0 }))}
                min={1}
                max={50}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Global Stop Loss (%)</label>
              <input
                type="number"
                className="input"
                value={risk.stopLoss}
                onChange={e => setRisk(prev => ({ ...prev, stopLoss: parseInt(e.target.value) || 0 }))}
                min={1}
                max={30}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Rebalance Frequency</label>
              <select
                className="select"
                value={risk.rebalanceFreq}
                onChange={e => setRisk(prev => ({ ...prev, rebalanceFreq: e.target.value }))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {Object.entries(notifLabels).map(([key, label]) => (
              <div
                key={key}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => toggleNotif(key)}
              >
                <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-primary)' }}>{label}</span>
                <div className={`toggle ${notifications[key] ? 'active' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <h3 className="section-title">API Keys</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
          {['Exchange API Key', 'Exchange API Secret', 'Social Media API Token'].map((label, i) => (
            <div key={i} className="input-group">
              <label className="input-label">{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input"
                  value={showApiKey ? 'sk-xxxx-1234-5678-abcd' : '••••••••••••••••'}
                  readOnly
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer',
                  }}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
