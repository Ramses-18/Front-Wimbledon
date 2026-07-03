import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext.jsx'

const G = '#1B5E20'
const BORDER = '#E0E0D8'

export default function HistorialPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [picks, setPicks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setError('Falta el ID del usuario.')
      setLoading(false)
      return
    }

    Promise.all([
      api.get(`/leaderboard/${userId}/picks`),
      api.get('/leaderboard'),
    ])
      .then(([picksRes, lbRes]) => {
        setPicks(picksRes.data)
        const me = lbRes.data.find(u => String(u.userId ?? u.id) === String(userId))
        setUser(me || null)
      })
      .catch(e => {
        console.error(e)
        setError(e.response?.data?.error || 'Error al cargar el historial.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  const fmtFecha = (fecha) => {
    if (!fecha) return ''
    try {
      return new Date(fecha + 'T00:00:00')
        .toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    } catch { return fecha }
  }

  const STATUS_LABEL = {
    'SCHEDULED':  'Por jugar',
    'IN_PLAY':    'En juego',
    'SUSPENDED':  'Suspendido',
    'FINISHED':   'Finalizado',
    'WALKOVER':   'Walkover',
    'RETIRED':    'Retiro',
    'ABANDONED':  'Abandonado',
  }

  const STATUS_COLORS = {
    'SCHEDULED':  { bg: '#F5F5F5', color: '#888' },
    'IN_PLAY':    { bg: '#FFEBEE', color: '#C62828' },
    'SUSPENDED':  { bg: '#FFF3E0', color: '#E65100' },
    'FINISHED':   { bg: '#E8F5E9', color: '#1B5E20' },
    'WALKOVER':   { bg: '#F3E5F5', color: '#7B1FA2' },
    'RETIRED':    { bg: '#F3E5F5', color: '#7B1FA2' },
    'ABANDONED':  { bg: '#EFEBE9', color: '#5D4037' },
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Back bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, marginLeft: -8,
      }}>
        <button
          onClick={() => navigate('/tabla')}
          style={{
            background: 'none', border: 'none', color: G,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            padding: '6px 8px',
          }}
        >← Volver</button>
        <h2 style={{
          fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700,
        }}>Historial de picks</h2>
      </div>

      {loading && <div className="spinner" />}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* User card */}
          {user && (
            <div style={{
              background: G, color: 'white',
              padding: 16, borderRadius: 12, marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
                  {user.name}
                </h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
                  {picks.length} {picks.length === 1 ? 'pick realizado' : 'picks realizados'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#C9A84C' }}>
                  {user.totalPoints ?? 0}
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,.6)',
                  fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em',
                }}>pts totales</div>
              </div>
            </div>
          )}

          {/* Lista de picks */}
          {picks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>Este usuario todavía no tiene picks.</p>
            </div>
          ) : (
            picks.map(p => {
              const sc = STATUS_COLORS[p.matchStatus] || STATUS_COLORS['SCHEDULED']
              const pts = p.pointsEarned || 0
              const ptsClass = pts > 0 ? 'positivo' : 'cero'
              return (
                <div key={p.matchId} style={{
                  background: 'white', border: `1px solid ${BORDER}`,
                  borderRadius: 10, padding: '12px 14px', marginBottom: 10,
                }}>
                  {/* Meta */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 10, color: '#888', marginBottom: 8,
                  }}>
                    <span>{fmtFecha(p.matchDate)} · {p.round || '—'}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 10,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      background: sc.bg, color: sc.color,
                    }}>
                      {STATUS_LABEL[p.matchStatus] || p.matchStatus}
                    </span>
                  </div>

                  {/* Match */}
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8,
                  }}>
                    {p.player1}
                    <span style={{ color: '#C0C0B8', fontSize: 11, fontWeight: 400, margin: '0 4px' }}>vs</span>
                    {p.player2}
                  </div>

                  {/* Pick detail */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 8, borderTop: `1px dashed ${BORDER}`,
                    fontSize: 12,
                  }}>
                    <div style={{ color: '#444' }}>
                      Tu pick: <strong style={{ color: G }}>{p.pickWinner}</strong>
                      {p.pickSetsWinner ? ` · ${p.pickSetsWinner} sets` : ''}
                      {p.isCorrection && (
                        <span style={{ fontSize: 10, color: '#C9A84C', marginLeft: 6 }}>✎ corrección</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 12,
                      background: pts > 0 ? G : '#E0E0D8',
                      color: pts > 0 ? 'white' : '#888',
                    }}>
                      {pts > 0 ? `+${pts}` : '0'} pts
                    </div>
                  </div>

                  {/* Real result */}
                  {p.realWinner && (
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                      Resultado real: <strong style={{ color: '#444' }}>{p.realWinner}</strong>
                      {p.realSetsWinner ? ` · ${p.realSetsWinner} sets` : ''}
                      {p.realScore ? ` · ${p.realScore}` : ''}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </>
      )}
    </div>
  )
}
