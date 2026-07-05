import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext.jsx'

const G = 'var(--green)'
const BORDER = 'var(--border)'

export default function LigaLeaderboardPage() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/leagues/${leagueId}/leaderboard`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [leagueId])

  const rankColors = (i) => {
    if (i === 0) return { background: 'var(--gold)', color: 'white' }
    if (i === 1) return { background: '#9E9E9E', color: 'white' }
    if (i === 2) return { background: '#A1887F', color: 'white' }
    return { background: 'var(--border)', color: 'var(--text-mid)' }
  }

  const myEmail = JSON.parse(localStorage.getItem('wim_user') || '{}').email

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, marginLeft: -8,
      }}>
        <button onClick={() => navigate('/ligas')} style={{
          background: 'none', border: 'none', color: G,
          fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 8px',
        }}>
          ← Volver
        </button>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700 }}>
          {loading ? 'Liga' : data?.leagueName || 'Liga'}
        </h2>
      </div>

      {loading && <div className="spinner" />}

      {!loading && data && (
        <>
          {/* Code badge */}
          <div style={{
            textAlign: 'center', marginBottom: 16, padding: 10,
            background: 'var(--gold-bg)', borderRadius: 10,
            border: '1px solid var(--gold)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Codigo de la liga
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: 'var(--gold)',
              letterSpacing: '.15em', fontFamily: 'monospace',
            }}>
              {data.leagueCode}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Compartilo para que tus amigos se unan
            </div>
          </div>

          {/* Leaderboard */}
          {data.members.length === 0 ? (
            <div className="empty-state">
              <div className="icon">👥</div>
              <p>No hay miembros en esta liga todavia.</p>
            </div>
          ) : (
            <div style={{
              background: 'var(--card-bg)', border: `1px solid ${BORDER}`,
              borderRadius: 12, overflow: 'hidden',
            }}>
              {data.members.map((u, i) => {
                const rc = rankColors(i)
                const isMe = u.email === myEmail
                return (
                  <div key={u.email} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 16px', gap: 14,
                    borderBottom: i < data.members.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isMe ? 'var(--green-pale)' : 'var(--card-bg)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: rc.background, color: rc.color,
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</div>
                    <div style={{
                      flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {u.name}
                      {isMe && <span style={{ fontSize: 10, color: G, marginLeft: 6, fontWeight: 700 }}>(vos)</span>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: G, fontFeatureSettings: '"tnum"' }}>
                      {u.totalPoints ?? 0}
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 3 }}>pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}