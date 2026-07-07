import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  {
    path: '/',
    label: 'Hoy',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    path: '/tabla',
    label: 'Scores',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    path: '/bracket',
    label: 'Draw',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="8" y="14" width="8" height="7" rx="1" />
        <line x1="7" y1="10" x2="12" y2="14" /><line x1="17" y1="10" x2="12" y2="14" />
      </svg>
    ),
  },
  {
    path: '/ranking',
    label: 'Ranking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8M12 17v4M7 4h10l1 7H6l1-7z" /><path d="M5.5 11l-1.5 5h2.5l1-2h8.5l1 2h2.5l-1.5-5" />
      </svg>
    ),
  },
]

const ADMIN_TAB = {
  path: '/admin',
  label: 'Admin',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const tabs = user?.role === 'ADMIN'
    ? [...TABS, ADMIN_TAB]
    : TABS

  // Dark mode when on Today page (matches dark Centre Court design)
  const isDark = pathname === '/'

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: isDark ? '#0a1a0f' : 'var(--card-bg)',
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'var(--border)'}`,
      display: 'flex', zIndex: 100, height: 60,
    }}>
      {tabs.map(t => {
        const active = pathname === t.path || (t.path !== '/' && pathname.startsWith(t.path))
        return (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1, border: 'none', background: 'none',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              color: active
                ? (isDark ? '#4CAF50' : 'var(--green)')
                : (isDark ? 'rgba(255,255,255,.3)' : 'var(--text-muted)'),
              fontSize: 10, fontWeight: active ? 700 : 500,
              position: 'relative',
            }}
          >
            {/* Active dot */}
            {active && (
              <div style={{
                position: 'absolute', top: 6,
                width: 4, height: 4, borderRadius: 2,
                background: isDark ? '#4CAF50' : 'var(--green)',
              }} />
            )}
            {t.icon}
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}