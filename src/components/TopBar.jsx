import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function TopBar() {
  const { user, logout } = useAuth()
  return (
    <div style={{
      background: '#1B5E20', color: 'white', padding: '13px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700 }}>
          🎾 Wimbledon 2026
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 1 }}>
          {user?.name}
        </div>
      </div>
      <button onClick={logout} style={{
        background: 'rgba(255,255,255,.15)', border: 'none', color: 'white',
        fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 600,
      }}>
        Salir
      </button>
    </div>
  )
}
