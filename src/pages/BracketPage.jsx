import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'

// ── Colour tokens (dark Centre Court) ──
const C = {
  bg:         '#0a1a0f',
  green:      '#4CAF50',
  greenDeep:  '#1B5E20',
  greenPale:  'rgba(76,175,80,.08)',
  white:      '#fff',
  white50:    'rgba(255,255,255,.50)',
  white45:    'rgba(255,255,255,.45)',
  white35:    'rgba(255,255,255,.35)',
  white30:    'rgba(255,255,255,.30)',
  white25:    'rgba(255,255,255,.25)',
  white18:    'rgba(255,255,255,.18)',
  white12:    'rgba(255,255,255,.12)',
  white06:    'rgba(255,255,255,.06)',
  gold:       '#C8A951',
  red:        '#f44336',
}

const ROUND_LABELS = {
  'R128': '1ra ronda',
  'R64':  '2da ronda',
  'R32':  '3ra ronda',
  'R16':  '4ta ronda',
  'QF':   'Cuartos',
  'SF':   'Semis',
  'F':    'Final',
}

const ROUND_ORDER = ['R128','R64','R32','R16','QF','SF','F']

export default function BracketPage() {
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRound, setSelectedRound] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/bracket')
      setBracket(data)
      const playedRounds = ROUND_ORDER.filter(r =>
        data.matches.some(m => m.round === r && (m.player1 || m.player2))
      )
      if (playedRounds.length > 0) {
        setSelectedRound(playedRounds[playedRounds.length - 1])
      } else if (data.rounds?.length > 0) {
        setSelectedRound(data.rounds[0].key)
      }
    } catch (e) {
      console.error(e)
      setError('No se pudo cargar el cuadro. Es probable que el admin aún no lo haya inicializado.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <div style={{ padding: 16 }}><div className="spinner" /></div>
    </div>
  )

  if (error || !bracket) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.white, padding: 16 }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 300, color: C.white50, letterSpacing: '.04em' }}>Cuadro</h2>
        <p style={{ fontSize: 10, color: C.white30, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>Singles Masculino · Wimbledon 2026</p>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 14, color: C.white30 }}>{error || 'Cuadro no disponible.'}</p>
        </div>
      </div>
    )
  }

  const byRound = {}
  bracket.matches.forEach(m => {
    if (!byRound[m.round]) byRound[m.round] = []
    byRound[m.round].push(m)
  })
  Object.keys(byRound).forEach(r => {
    byRound[r].sort((a, b) => a.positionInRound - b.positionInRound)
  })

  const roundsToShow = selectedRound ? [selectedRound] : ROUND_ORDER

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
          }}>Cuadro</h2>
          <p style={{
            fontSize: 10, color: C.white30, letterSpacing: '.1em',
            textTransform: 'uppercase', marginTop: 4, margin: '4px 0 0',
          }}>Singles Masculino · Wimbledon 2026</p>
        </div>

        {/* Champion banner */}
        {bracket.champion && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(200,169,81,.15) 0%, rgba(200,169,81,.05) 100%)',
            border: '1px solid rgba(200,169,81,.2)', borderRadius: 12,
            padding: '16px 18px', marginBottom: 20, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 9, color: 'rgba(200,169,81,.6)', letterSpacing: '.15em',
              textTransform: 'uppercase', fontWeight: 700, marginBottom: 4,
            }}>Campeón</div>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: C.gold,
            }}>{bracket.champion}</div>
          </div>
        )}

        {/* Round pills */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          {bracket.rounds.map(r => {
            const on = selectedRound === r.key
            const count = (byRound[r.key] || []).filter(m => m.player1 || m.player2).length
            return (
              <button key={r.key} onClick={() => setSelectedRound(r.key)} style={{
                padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6,
                border: `1px solid ${on ? C.green : C.white12}`,
                background: on ? C.green : 'transparent',
                color: on ? '#fff' : C.white35,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                {ROUND_LABELS[r.key] || r.key}
                <span style={{
                  display: 'inline-block', marginLeft: 4,
                  background: on ? 'rgba(255,255,255,.2)' : C.white06,
                  padding: '1px 5px', borderRadius: 8, fontSize: 8,
                }}>{count}{r.count > 0 ? `/${r.count}` : ''}</span>
              </button>
            )
          })}
        </div>

        {/* Match list */}
        {roundsToShow.map(round => {
          const matches = (byRound[round] || []).filter(m => m.player1 || m.player2)
          return (
            <div key={round} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.white25, marginBottom: 10,
                letterSpacing: '.08em', textTransform: 'uppercase',
              }}>
                {ROUND_LABELS[round] || round} · {matches.length} partido{matches.length !== 1 ? 's' : ''}
              </div>

              {matches.length === 0 ? (
                <p style={{ fontSize: 12, color: C.white30, padding: '12px 0' }}>
                  No hay partidos en esta ronda todavía.
                </p>
              ) : (
                matches.map(m => (
                  <MatchRow key={m.id} match={m} onClick={() => setDetail(m)} />
                ))
              )}
            </div>
          )
        })}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: C.white25 }}>
          <LegendDot color={C.green} label="Finalizado" />
          <LegendDot color={C.red} label="En vivo" />
          <LegendDot color={C.white18} label="Por jugar" />
        </div>
      </div>

      {/* Detail modal */}
      {detail && <DetailModal match={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: color,
      }} />
      <span>{label}</span>
    </div>
  )
}

function MatchRow({ match, onClick }) {
  const isLive = match.status === 'IN_PLAY'
  const isFinished = match.status === 'FINISHED' || match.winner
  const sets = match.scoreStr
    ? match.scoreStr.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const p1Wins = match.winner === match.player1
  const p2Wins = match.winner === match.player2

  // Result text
  let resultText = '—'
  let label = ''
  let resultColor = C.white06
  let resultWeight = 200

  if (isLive) {
    resultText = `${match.setsWinner ?? 0}-${match.setsLoser ?? 0}`
    label = 'LIVE'
    resultColor = C.red
    resultWeight = 600
  } else if (isFinished) {
    resultText = `${match.setsWinner ?? 0}-${match.setsLoser ?? 0}`
    label = 'SET SCORE'
    resultColor = C.white
    resultWeight = 200
  }

  // Schedule info
  const scheduleInfo = match.scheduledTime || match.courtName || ''

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 0',
        borderBottom: `1px solid ${C.white06}`,
        cursor: 'pointer',
        transition: 'opacity .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {/* Player names */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: p1Wins ? 600 : 500,
          color: p1Wins ? C.green : match.player1 ? C.white45 : C.white25,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.player1 || 'Por definir'}
        </div>
        <div style={{
          fontSize: 14, fontWeight: p2Wins ? 600 : 500, marginTop: 2,
          color: p2Wins ? C.green : match.player2 ? C.white30 : C.white18,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.player2 || 'Por definir'}
        </div>
      </div>

      {/* Result */}
      <div style={{ marginLeft: 14, flexShrink: 0, textAlign: 'right' }}>
        {isLive || isFinished ? (
          <>
            <div style={{
              fontSize: 26, fontWeight: resultWeight, color: resultColor,
              fontFeatureSettings: '"tnum"', letterSpacing: '-.02em', lineHeight: 1,
            }}>
              {resultText}
            </div>
            <div style={{
              fontSize: 8, letterSpacing: '.1em', color: isLive ? C.red : C.white18,
              fontWeight: 600, marginTop: 3, textTransform: 'uppercase',
            }}>
              {label}
            </div>
            {sets.length > 0 && (
              <div style={{
                fontSize: 9, color: C.white18, marginTop: 2, fontWeight: 500,
              }}>
                {sets.join(' ')}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 26, fontWeight: 200, color: C.white06,
              fontFeatureSettings: '"tnum"', letterSpacing: '-.02em', lineHeight: 1,
            }}>
              —
            </div>
            {scheduleInfo && (
              <div style={{
                fontSize: 8, letterSpacing: '.1em', color: C.white18,
                fontWeight: 500, marginTop: 3, textTransform: 'uppercase',
              }}>
                {scheduleInfo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailModal({ match, onClose }) {
  const isLive = match.status === 'IN_PLAY'
  const isFinished = match.status === 'FINISHED' || match.winner
  const sets = match.scoreStr
    ? match.scoreStr.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', borderRadius: '20px 20px 0 0',
        padding: '12px 20px 32px', width: '100%', maxWidth: 430,
        maxHeight: '70vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: C.white18,
          margin: '0 auto 16px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white50 }}>
            {ROUND_LABELS[match.round] || match.round} · #{match.positionInRound}
          </div>
          <button onClick={onClose} style={{
            background: C.white06, border: 'none', color: C.white35,
            width: 28, height: 28, borderRadius: '50%', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Players */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: `1px solid ${C.white06}`,
          }}>
            <span style={{
              fontWeight: match.winner === match.player1 ? 700 : 500,
              color: match.winner === match.player1 ? C.green : C.white50,
              fontSize: 15,
            }}>
              {match.winner === match.player1 ? '✓ ' : ''}{match.player1 || 'Por definir'}
            </span>
            {isFinished && (
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFeatureSettings: '"tnum"' }}>
                {match.setsWinner ?? 0}-{match.setsLoser ?? 0}
              </span>
            )}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
          }}>
            <span style={{
              fontWeight: match.winner === match.player2 ? 700 : 500,
              color: match.winner === match.player2 ? C.green : C.white50,
              fontSize: 15,
            }}>
              {match.winner === match.player2 ? '✓ ' : ''}{match.player2 || 'Por definir'}
            </span>
          </div>
        </div>

        {/* Sets detail */}
        {sets.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: C.white25, letterSpacing: '.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>Sets</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {sets.map((s, i) => {
                const parts = s.split('-')
                return (
                  <div key={i} style={{
                    flex: 1, textAlign: 'center', padding: '8px 4px',
                    background: C.white06, borderRadius: 6,
                  }}>
                    <div style={{
                      fontSize: 9, color: C.white18, marginBottom: 4, fontWeight: 600,
                    }}>SET {i + 1}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, fontFeatureSettings: '"tnum"',
                        color: match.winner === match.player1
                          ? (parseInt(parts[0]) >= parseInt(parts[1]) ? C.green : C.white35)
                          : C.white35,
                      }}>{parts[0]?.trim()}</span>
                      <span style={{ fontSize: 12, color: C.white18 }}>-</span>
                      <span style={{
                        fontSize: 14, fontWeight: 700, fontFeatureSettings: '"tnum"',
                        color: match.winner === match.player2
                          ? (parseInt(parts[1]) > parseInt(parts[0]) ? C.green : C.white35)
                          : C.white35,
                      }}>{parts[1]?.trim()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Status */}
        <div style={{ fontSize: 12, color: C.white25, marginBottom: 4 }}>
          <div style={{ padding: '4px 0' }}>
            <strong style={{ color: C.white35 }}>Estado:</strong>{' '}
            {isLive ? 'En vivo' : match.status === 'SUSPENDED' ? 'Suspendido' : isFinished ? 'Finalizado' : 'Por jugar'}
          </div>
          {match.scoreStr && (
            <div style={{ padding: '4px 0' }}>
              <strong style={{ color: C.white35 }}>Score:</strong> {match.scoreStr}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          marginTop: 20, width: '100%', padding: '12px',
          background: 'transparent', border: `1px solid ${C.white12}`,
          color: C.white50, fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer',
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}