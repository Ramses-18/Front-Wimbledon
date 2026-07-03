import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext.jsx'

const G = '#1B5E20'
const BORDER = '#E0E0D8'

export default function TablaPage() {
  const navigate = useNavigate()
  const [lb, setLb] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    // Cargar tabla + id del usuario logueado (sacado del localStorage)
    const stored = localStorage.getItem('wim_user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        // Buscar el usuario en la tabla para obtener su id
        setCurrentUserIdByEmail(u.email)
      } catch {}
    }

    api.get('/leaderboard')
      .then(r => {
        setLb(r.data)
        // Si no pudimos obtener el id por email, intentamos matchear por name
        const stored2 = localStorage.getItem('wim_user')
        if (stored2) {
          const u = JSON.parse(stored2)
          const me = r.data.find(x => x.email === u.email)
          if (me) setCurrentUserId(me.userId ?? me.id ?? null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const setCurrentUserIdByEmail = (email) => {
    // Se completa después de cargar la tabla
  }

  const fmt = (n) => n ?? 0

  const rankColors = (i) => {
    if (i === 0) return { background: '#C9A84C', color: 'white' }       // 1° dorado
    if (i === 1) return { background: '#9E9E9E', color: 'white' }       // 2° plata
    if (i === 2) return { background: '#A1887F', color: 'white' }       // 3° bronce
    return { background: '#E0E0D8', color: '#444' }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{
        fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700,
        marginBottom: 2, color: '#1A1A1A',
      }}>Tabla de Posiciones</h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
        Puntos acumulados Wimbledon 2026
      </p>

      {loading && <div className="spinner" />}

      {!loading && lb.length === 0 && (
        <div className="empty-state">
          <div className="icon">🏅</div>
          <p>Todavía no hay usuarios con puntos.</p>
        </div>
      )}

      {!loading && lb.length > 0 && (
        <>
          <div style={{
            background: 'white', border: `1px solid ${BORDER}`,
            borderRadius: 12, overflow: 'hidden', marginBottom: 16,
          }}>
            {lb.map((u, i) => {
              const rc = rankColors(i)
              const isMe = u.email === (JSON.parse(localStorage.getItem('wim_user') || '{}').email)
              return (
                <div
                  key={u.email}
                  onClick={() => navigate(`/historial/${u.userId ?? u.id ?? ''}`)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 16px', gap: 14, cursor: 'pointer',
                    borderBottom: i < lb.length - 1 ? '1px solid #F0F0F0' : 'none',
                    background: isMe ? '#F1F8F1' : 'white',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = '#F8F8F5' }}
                  onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'white' }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: rc.background, color: rc.color,
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</div>

                  <div style={{
                    flex: 1, fontSize: 15, fontWeight: 600, color: '#1A1A1A',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {u.name}
                    {isMe && <span style={{ fontSize: 10, color: G, marginLeft: 6, fontWeight: 700 }}>(vos)</span>}
                  </div>

                  <div style={{
                    fontSize: 18, fontWeight: 700, color: G,
                    fontFeatureSettings: '"tnum"',
                  }}>
                    {fmt(u.totalPoints)}
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#888', marginLeft: 3 }}>pts</span>
                  </div>

                  <div style={{ color: '#C0C0B8', fontSize: 14, marginLeft: 4 }}>›</div>
                </div>
              )
            })}
          </div>

          {/* Botón acceso rápido a mi historial */}
          {currentUserId != null && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => navigate(`/historial/${currentUserId}`)}
                style={{
                  background: 'white', border: `1px solid ${G}`, color: G,
                  fontSize: 12, fontWeight: 600, padding: '10px 16px',
                  borderRadius: 8, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                📜 Ver mis picks históricos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
