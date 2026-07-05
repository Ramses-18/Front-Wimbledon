import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  { path: '/',       label: 'Hoy' },
  { path: '/tabla',  label: 'Tabla' },
  
  { path: '/bracket',label: 'Cuadro' },
  { path: '/ranking',label: 'Ranking' },
]
const ADMIN_TAB = { path: '/admin', label: 'Admin' }

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const tabs = user?.role === 'ADMIN' 
    ? [...TABS, ADMIN_TAB] 
    : TABS

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'var(--card-bg)', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 100,
    }}>
      {tabs.map(t => {
        const active = pathname === t.path || (t.path !== '/' && pathname.startsWith(t.path))
        return (
          <button key={t.path} onClick={() => navigate(t.path)} style={{
            flex: 1, padding: '0 2px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', height: 52,
            color: active ? 'var(--green)' : 'var(--text-muted)',
            fontSize: 11, fontWeight: active ? 700 : 500,
          }}>
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}