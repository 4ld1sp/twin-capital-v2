import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Smartphone, FlaskConical,
  Settings, User, LogOut, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trading', icon: TrendingUp, label: 'Trading' },
  { to: '/media', icon: Smartphone, label: 'Media' },
  { to: '/research', icon: FlaskConical, label: 'Research' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${!collapsed ? 'visible' : ''}`}
        onClick={() => setCollapsed(true)} />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="logo-icon">TC</span>
            {!collapsed && <span className="logo-text">TWIN CAPITAL</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Main Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider + Bottom Nav */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />
          {bottomItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </aside>

      <style>{`
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 98;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          z-index: 99;
          transition: width var(--transition-base);
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg) var(--space-md);
          border-bottom: 1px solid var(--border-subtle);
          min-height: 72px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          overflow: hidden;
          white-space: nowrap;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          background: linear-gradient(135deg, var(--accent-teal), var(--accent-cyan));
          color: var(--text-inverse);
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-toggle {
          background: transparent;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .sidebar-toggle:hover {
          color: var(--text-primary);
          border-color: var(--accent-cyan);
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-md) var(--space-sm);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: var(--fs-body);
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .sidebar-link.active {
          color: var(--accent-teal);
          background: var(--accent-teal-dim);
        }

        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 3px;
          background: var(--accent-teal);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-bottom {
          padding: var(--space-sm);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-sm) var(--space-sm) var(--space-md);
        }

        @media (max-width: 1199px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar:not(.collapsed) {
            transform: translateX(0);
          }
          .sidebar-overlay.visible {
            display: block;
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
