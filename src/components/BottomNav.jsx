import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  { path: '/',       icon: '📋', label: 'Hoy' },
  { path: '/tabla',  icon: '🏅', label: 'Tabla' },
  { path: '/torneo', icon: '🏆', label: 'Torneo' },
]
const ADMIN_TAB = { path: '/admin', icon: '⚙️', label: 'Admin' }

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const tabs = user?.role === 'ADMIN' ? [...TABS, ADMIN_TAB] : TABS

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'white', borderTop: '1px solid #E0E0D8',
      display: 'flex', zIndex: 100,
    }}>
      {tabs.map(t => {
        const active = pathname === t.path
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{
            flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            color: active ? '#1B5E20' : '#888888',
            fontSize: 10, fontWeight: active ? 700 : 500,
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
