import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'

const G = 'var(--green)'

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
      // Seleccionar la ronda más avanzada que tenga al menos 1 partido con jugadores
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
      setError('No se pudo cargar el bracket. Es probable que el admin aún no lo haya inicializado.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div style={{ padding: 16 }}><div className="spinner" /></div>

  if (error || !bracket) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, marginBottom: 4 }}>Bracket del torneo</h1>
        <p className="text-muted mb-12">Cuadro completo · Singles Masculino</p>
        <div className="empty-state">
          <div className="icon">🏆</div>
          <p>{error || 'Bracket no disponible.'}</p>
        </div>
      </div>
    )
  }

  // Agrupar matches por ronda
  const byRound = {}
  bracket.matches.forEach(m => {
    if (!byRound[m.round]) byRound[m.round] = []
    byRound[m.round].push(m)
  })
  Object.keys(byRound).forEach(r => {
    byRound[r].sort((a, b) => a.positionInRound - b.positionInRound)
  })

  // Si hay ronda seleccionada, mostrar solo esa; si no, mostrar todas en scroll horizontal
  const roundsToShow = selectedRound ? [selectedRound] : ROUND_ORDER

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, marginBottom: 2 }}>Bracket del torneo</h1>
      <p className="text-muted mb-12">Cuadro completo · Singles Masculino</p>

      {/* Campeón */}
      {bracket.champion && (
        <div style={{
          background: 'linear-gradient(135deg, var(--gold) 0%, #E6C870 100%)',
          color: 'white', padding: 18, borderRadius: 12, marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🏆</div>
          <div style={{ fontSize: 11, opacity: .8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Campeón</div>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700 }}>{bracket.champion}</div>
        </div>
      )}

      {/* Selector de ronda */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {bracket.rounds.map(r => (
          <button key={r.key} onClick={() => setSelectedRound(r.key)} style={{
            padding: '7px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
            border: `1px solid ${selectedRound === r.key ? G : 'var(--border)'}`,
            background: selectedRound === r.key ? G : 'var(--card-bg)',
            color: selectedRound === r.key ? 'white' : 'var(--text-muted)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {ROUND_LABELS[r.key] || r.key}
            <span style={{
              display: 'inline-block', marginLeft: 4,
              background: selectedRound === r.key ? 'rgba(255,255,255,.2)' : 'var(--green-pale)',
              padding: '1px 5px', borderRadius: 8, fontSize: 9,
            }}>{byRound[r.key]?.filter(m => m.player1 || m.player2).length || 0}/{r.count}</span>
          </button>
        ))}
      </div>

      {/* Lista de partidos de la ronda seleccionada */}
      {roundsToShow.map(round => {
        const matches = byRound[round] || []
        return (
          <div key={round} style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: 13, fontWeight: 700, color: G, marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '.05em',
            }}>
              {ROUND_LABELS[round] || round} · {matches.filter(m => m.player1 || m.player2).length}/{matches.length}
            </h3>

            {matches.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>
                No hay partidos en esta ronda todavía.
              </p>
            ) : (
              matches.map(m => (
                <BracketMatchCard key={m.id} match={m} onClick={() => setDetail(m)} />
              ))
            )}
          </div>
        )
      })}

      {/* Leyenda */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 16, fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap',
      }}>
        <LegendItem color="var(--green-light)" label="Jugado" />
        <LegendItem color="var(--danger-bg)" label="En vivo" />
        <LegendItem color="var(--card-bg)" label="Por jugar" border />
      </div>

      {/* Modal detalle */}
      {detail && <DetailModal match={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function LegendItem({ color, label, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 12, height: 12, borderRadius: 2,
        background: color, border: `1px solid ${border ? 'var(--border)' : 'transparent'}`,
        opacity: border ? .5 : 1,
      }}></div>
      <span>{label}</span>
    </div>
  )
}

function BracketMatchCard({ match, onClick }) {
  const isLive = match.status === 'IN_PLAY'
  const isFinished = match.status === 'FINISHED' || match.winner

  const bg = isLive ? 'var(--danger-bg)' : isFinished ? 'var(--green-pale)' : 'var(--card-bg)'
  const border = isLive ? 'var(--danger)' : isFinished ? 'var(--green-mid)' : 'var(--border)'

  return (
    <div onClick={onClick} style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 8,
      padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
      transition: 'transform .1s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <PlayerRow name={match.player1} winner={match.winner === match.player1} score={match.scoreStr} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '1px 0', fontWeight: 700 }}>VS</div>
          <PlayerRow name={match.player2} winner={match.winner === match.player2} />
        </div>
        {isLive && (
          <span style={{
            marginLeft: 8, fontSize: 9, fontWeight: 700, color: 'var(--danger)',
            padding: '2px 7px', borderRadius: 20, background: 'var(--danger-bg)', whiteSpace: 'nowrap',
          }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', marginRight: 4, animation: 'spin 1s infinite' }}></span>
            LIVE
          </span>
        )}
      </div>
      {match.player1 === null && match.player2 === null && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
          Por definir (depende de la ronda anterior)
        </div>
      )}
    </div>
  )
}

function PlayerRow({ name, winner, score }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '2px 0', fontSize: 13,
    }}>
      <span style={{
        fontWeight: winner ? 700 : 500,
        color: winner ? G : name ? 'var(--text)' : 'var(--text-muted)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {winner ? '✓ ' : ''}{name || 'Por definir'}
      </span>
      {score && winner && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{score.split(',')[0]}</span>
      )}
    </div>
  )
}

function DetailModal({ match, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">{ROUND_LABELS[match.round] || match.round} · Partido #{match.positionInRound}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="text-muted mb-12">Detalle del partido</p>

        <div style={{ fontSize: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, color: match.winner === match.player1 ? G : 'var(--text)' }}>
              {match.winner === match.player1 ? '✓ ' : ''}{match.player1 || 'Por definir'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{match.scoreStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontWeight: 700, color: match.winner === match.player2 ? G : 'var(--text)' }}>
              {match.winner === match.player2 ? '✓ ' : ''}{match.player2 || 'Por definir'}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          <div style={{ padding: '4px 0' }}>
            <strong>Estado:</strong> {match.status === 'IN_PLAY' ? '🔴 En vivo' : match.winner ? '✓ Finalizado' : '⏳ Por jugar'}
          </div>
          {match.setsWinner && (
            <div style={{ padding: '4px 0' }}>
              <strong>Resultado:</strong> {match.setsWinner}-{match.setsLoser}
            </div>
          )}
          {match.scoreStr && (
            <div style={{ padding: '4px 0' }}>
              <strong>Score:</strong> {match.scoreStr}
            </div>
          )}
        </div>

        <button className="btn btn-outline btn-full" onClick={onClose} style={{ marginTop: 14 }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
