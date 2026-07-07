import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext.jsx'

// ── Colour tokens (dark Centre Court) ──
const C = {
  bg:         '#0a1a0f',
  green:      '#4CAF50',
  greenDeep:  '#1B5E20',
  greenPale:  'rgba(76,175,80,.08)',
  white:      '#fff',
  white50:    'rgba(255,255,255,.50)',
  white30:    'rgba(255,255,255,.30)',
  white18:    'rgba(255,255,255,.18)',
  white12:    'rgba(255,255,255,.12)',
  white06:    'rgba(255,255,255,.06)',
  gold:       '#C8A951',
}

export default function TablaPage() {
  const navigate = useNavigate()
  const [lb, setLb] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [hasTorneoPick, setHasTorneoPick] = useState(null)

  useEffect(() => {
    api.get('/leaderboard')
      .then(r => {
        setLb(r.data)
        const stored = localStorage.getItem('wim_user')
        if (stored) {
          const u = JSON.parse(stored)
          const me = r.data.find(x => x.email === u.email)
          if (me) setCurrentUserId(me.userId ?? me.id ?? null)
        }
      })
      .catch(console.error)

    api.get('/tournament/my-pick')
      .then(r => {
        const pick = r.data
        setHasTorneoPick(!!(pick?.champion))
      })
      .catch(() => setHasTorneoPick(false))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n ?? 0
  const myEmail = (() => { try { return JSON.parse(localStorage.getItem('wim_user') || '{}').email } catch { return '' } })()

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      {/* Green left stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: C.greenDeep, zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 16px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300,
            color: C.white50, letterSpacing: '.04em', margin: 0,
          }}>Posiciones</h2>
          <p style={{
            fontSize: 10, color: C.white30, letterSpacing: '.1em',
            textTransform: 'uppercase', marginTop: 4, margin: '4px 0 0',
          }}>Ranking general &middot; Wimbledon 2026</p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" />
            <p style={{ fontSize: 13, color: C.white30, marginTop: 10 }}>Cargando...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && lb.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 14, color: C.white30 }}>Todavía no hay usuarios con puntos.</p>
          </div>
        )}

        {/* List */}
        {!loading && lb.length > 0 && (
          <div>
            {lb.map((u, i) => {
              const isMe = u.email === myEmail
              return (
                <div
                  key={u.email}
                  onClick={() => navigate(`/historial/${u.userId ?? u.id ?? ''}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    padding: '16px 0',
                    borderBottom: i < lb.length - 1 ? `1px solid ${C.white12}` : 'none',
                    cursor: 'pointer',
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {/* Name */}
                  <div style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: 600,
                    color: isMe ? C.green : C.white,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {u.name}
                    {isMe && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: C.green, marginLeft: 6,
                      }}>(vos)</span>
                    )}
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: 24,
                    fontWeight: isMe ? 600 : 300,
                    color: isMe ? C.green : C.white,
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: '-.02em',
                    marginLeft: 16,
                  }}>
                    {fmt(u.totalPoints)}
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: C.white18,
                      marginLeft: 3, letterSpacing: '0',
                    }}>pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Torneo pick button */}
        {hasTorneoPick === false && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => navigate('/torneo')}
              style={{
                background: 'rgba(255,255,255,.08)', border: `1px solid ${C.white12}`,
                color: C.white50, fontSize: 13, fontWeight: 600,
                padding: '12px 20px', borderRadius: 10, cursor: 'pointer', width: '100%',
              }}
            >
              Hacé tu pronóstico de Torneo
            </button>
          </div>
        )}

        {/* My history shortcut */}
        {currentUserId != null && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={() => navigate(`/historial/${currentUserId}`)}
              style={{
                background: 'transparent', border: `1px solid ${C.greenDeep}`,
                color: C.green, fontSize: 12, fontWeight: 600,
                padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Ver mis picks históricos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}