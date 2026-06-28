import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'

const G = '#1B5E20'
const MEDALS = ['🥇','🥈','🥉']

function Podium({ entries }) {
  const [first, second, third] = entries
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20, alignItems: 'end' }}>
      {/* 2nd */}
      <div style={{
        background: 'white', border: '1px solid #E0E0D8', borderRadius: 12,
        padding: '14px 6px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 22 }}>🥈</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {second?.name || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          <strong style={{ color: G, fontSize: 16 }}>{second?.totalPoints ?? '—'}</strong> pts
        </div>
      </div>
      {/* 1st */}
      <div style={{
        background: '#FFF8E1', border: '1px solid #C9A84C', borderRadius: 12,
        padding: '18px 6px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 26 }}>🥇</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {first?.name || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          <strong style={{ color: G, fontSize: 18 }}>{first?.totalPoints ?? '—'}</strong> pts
        </div>
      </div>
      {/* 3rd */}
      <div style={{
        background: 'white', border: '1px solid #E0E0D8', borderRadius: 12,
        padding: '14px 6px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 22 }}>🥉</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {third?.name || '—'}
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
          <strong style={{ color: G, fontSize: 16 }}>{third?.totalPoints ?? '—'}</strong> pts
        </div>
      </div>
    </div>
  )
}

export default function TablaPage() {
  const [lb, setLb]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard')
      .then(r => setLb(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const PTS_RULES = [
    ['Acertar el ganador', '1 pt'],
    ['Acertar resultado en sets', '+3 pts'],
    ['Acertar resultado exacto en games', '+10 pts'],
    ['Campeón del torneo', '15 pts'],
    ['Semifinalista (c/u)', '10 pts'],
  ]

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Tabla de posiciones</h2>
      <p className="text-muted mb-12">Puntos acumulados · Wimbledon 2026</p>

      {loading && <div className="spinner" />}

      {!loading && lb.length < 2 && (
        <div className="empty-state">
          <div className="icon">🏅</div>
          <p>Invitá amigos para ver la tabla de posiciones.</p>
        </div>
      )}

      {!loading && lb.length >= 1 && (
        <>
          {lb.length >= 3 && <Podium entries={lb} />}

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            {lb.map((u, i) => (
              <div key={u.email} style={{
                display: 'flex', alignItems: 'center', padding: '13px 14px',
                borderBottom: i < lb.length - 1 ? '1px solid #E0E0D8' : 'none',
                gap: 12,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#888', width: 22 }}>
                  {i + 1}
                </span>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#E8F5E9', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: G,
                }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
                    Partidos: {u.dailyPoints} · Torneo: {u.tournamentPoints}
                    {u.correctionUsedToday && <span style={{ color: '#C9A84C', marginLeft: 6 }}>✎ corrección usada</span>}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: G }}>{u.totalPoints}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Points rules */}
      <h3 style={{ marginBottom: 10, fontSize: 15 }}>Sistema de puntos</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {PTS_RULES.map(([k, v], i) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 14px',
            borderBottom: i < PTS_RULES.length - 1 ? '1px solid #E0E0D8' : 'none',
          }}>
            <span style={{ fontSize: 13, color: '#444' }}>{k}</span>
            <span style={{
              background: '#FFF8E1', border: '1px solid #C9A84C',
              color: '#7B5C00', fontSize: 11, fontWeight: 700,
              padding: '3px 9px', borderRadius: 20,
            }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
