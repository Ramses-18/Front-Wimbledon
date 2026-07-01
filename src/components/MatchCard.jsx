import React, { useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G = '#1B5E20'
const GM = '#2E7D32'
const BORDER = '#E0E0D8'

export default function MatchCard({ match, onRefresh }) {
  const { show } = useToast()
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  const pick = match.myPick
  const res  = match.result

  const emptySetScore = () => ({ w: '', l: '' })
  const [form, setForm] = useState({
    winner: pick?.winner || '',
    sets: [
      emptySetScore(), emptySetScore(), emptySetScore(),
      emptySetScore(), emptySetScore()
    ]
  })

  // Cierre: 5 minutos antes del partido
  const deadline = (() => {
    const d = new Date(`${match.matchDate}T${match.matchTime}`)
    d.setMinutes(d.getMinutes() - 5)
    return d
  })()
  const closed = new Date() > deadline
  const fmtDeadline = deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const setWinner = v => setForm(f => ({ ...f, winner: v }))
  const setSetScore = (idx, side, val) => setForm(f => {
    const sets = f.sets.map((s, i) => i === idx ? { ...s, [side]: val } : s)
    return { ...f, sets }
  })

  // Calcular sets ganados por cada jugador según form
  const countSets = () => {
    let wSets = 0, lSets = 0
    form.sets.forEach(s => {
      if (s.w !== '' && s.l !== '') {
        const w = parseInt(s.w), l = parseInt(s.l)
        if (!isNaN(w) && !isNaN(l)) {
          if (w > l) wSets++; else if (l > w) lSets++
        }
      }
    })
    return { wSets, lSets }
  }

  // Parsear resultado de la API al formato de sets
  const parseApiResult = () => {
    if (!res) return null
    return {
      winner: res.winner,
      setsWinner: res.setsWinner,
      gamesWinner: res.gamesWinner,
      gamesLoser: res.gamesLoser,
    }
  }

  // Sets del resultado real (del backend)
  const resultSets = res?.gameResult
    ? res.gameResult.split(',').map(s => {
        const parts = s.trim().replace(/\(.*\)/, '').split('-')
        return parts.length === 2 ? { a: parts[0].trim(), b: parts[1].trim() } : null
      }).filter(Boolean)
    : null

  const submit = async (useCorrection = false) => {
    if (!form.winner) { show('Elegí un ganador.', 'error'); return }
    const { wSets, lSets } = countSets()
    const filledSets = form.sets.filter(s => s.w !== '' || s.l !== '')

    setBusy(true)
    try {
      await api.post(`/matches/${match.id}/pick`, {
        winner: form.winner,
        setsWinner: wSets > 0 ? wSets : null,
        gamesWinner: null,
        gamesLoser: null,
        useCorrection,
      })
      show(useCorrection ? 'Corrección guardada ✓' : 'Pronóstico guardado ✓')
      setEditing(false)
      onRefresh()
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar.', 'error')
    } finally { setBusy(false) }
  }

  const startEdit = () => {
    setForm(f => ({ ...f, winner: pick?.winner || '' }))
    setEditing(true)
  }

  const showForm = (!pick && !closed) || editing

  // Marcador por set del resultado real
  const ScoreBoxes = ({ isWinner }) => {
    if (!res) {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: 22, height: 22, border: `0.5px solid ${BORDER}`,
              borderRadius: 4, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11,
              background: 'var(--surface-1)', color: 'var(--text-muted)'
            }}>·</div>
          ))}
        </div>
      )
    }

    const playerIsWinner = (isWinner && true) || (!isWinner && false)
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2,3,4].map(i => {
          if (!resultSets || !resultSets[i]) {
            return (
              <div key={i} style={{
                width: 22, height: 22, border: `0.5px solid ${BORDER}`,
                borderRadius: 4, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11,
                background: 'var(--surface-1)', color: 'var(--text-muted)'
              }}>·</div>
            )
          }
          const setScore = isWinner ? resultSets[i]?.a : resultSets[i]?.b
          const won = parseInt(resultSets[i]?.a) > parseInt(resultSets[i]?.b)
          const thisWon = isWinner ? won : !won
          return (
            <div key={i} style={{
              width: 22, height: 22,
              border: `0.5px solid ${thisWon ? G : BORDER}`,
              borderRadius: 4, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 600,
              background: thisWon ? G : 'var(--surface-1)',
              color: thisWon ? '#fff' : 'var(--text-secondary)'
            }}>{setScore}</div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      {/* Header verde */}
      <div style={{
        background: G, padding: '8px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>
          {match.matchTime?.slice(0,5)} hs
        </span>
        <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600 }}>
          {match.court || 'Wimbledon'}
        </span>
        {match.round && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{match.round}</span>
        )}
      </div>

      {/* Banner cierre individual */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '7px 14px', background: 'var(--surface-1)',
        borderBottom: `0.5px solid ${BORDER}`,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cierre de pronóstico</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtDeadline} hs</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: closed ? '#FFCDD2' : '#C8E6C9',
          color: closed ? '#B71C1C' : '#1B5E20',
        }}>
          {closed ? 'Cerrado' : 'Abierto'}
        </span>
      </div>

      {/* Jugadores con marcador */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{match.player1}</span>
          <ScoreBoxes isWinner={res?.winner === match.player1} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '2px 0', fontWeight: 600, letterSpacing: '.05em' }}>
          VS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{match.player2}</span>
          <ScoreBoxes isWinner={res?.winner === match.player2} />
        </div>

        {res && (
          <div style={{
            marginTop: 8, padding: '7px 10px',
            background: '#F1F8F1', borderRadius: 6,
            fontSize: 12, color: G, fontWeight: 600,
          }}>
            ✓ {res.winner} ganó · {res.setsWinner} sets
          </div>
        )}
      </div>

      {/* Pick zone */}
      <div style={{ padding: '12px 14px 14px', borderTop: `1px dashed ${BORDER}`, marginTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GM, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
          Tu pronóstico
        </div>

        {/* Pick guardado */}
        {pick && !showForm && (
          <>
            <div style={{
              background: '#F1F8F1', border: '1px solid #C8E6C9',
              borderRadius: 8, padding: '10px 12px', fontSize: 13, color: G, fontWeight: 600,
            }}>
              🏆 {pick.winner}
              {pick.setsWinner ? ` · gana ${pick.setsWinner} sets` : ''}
              {pick.isCorrection && <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>(corrección)</span>}
            </div>
            {res && (
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700,
                color: pick.pointsEarned > 0 ? G : '#888' }}>
                {pick.pointsEarned > 0 ? `+${pick.pointsEarned} pts ✓` : '0 pts'}
              </div>
            )}
            {!closed && (
              <button onClick={startEdit} style={{
                width: '100%', marginTop: 8, padding: '8px',
                border: `1px dashed ${GM}`, borderRadius: 8,
                background: 'none', color: GM, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                ↺ Usar corrección del día
              </button>
            )}
          </>
        )}

        {/* Sin pick y cerrado */}
        {!pick && closed && (
          <p style={{ fontSize: 13, color: '#888' }}>Plazo cerrado · No enviaste pronóstico</p>
        )}

        {/* Formulario */}
        {showForm && (
          <div>
            {/* Botones ganador */}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Ganador</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[match.player1, match.player2].map(p => (
                <button key={p} onClick={() => setWinner(p)} style={{
                  flex: 1, padding: '10px 6px',
                  border: `1px solid ${form.winner === p ? G : BORDER}`,
                  borderRadius: 8,
                  background: form.winner === p ? G : 'white',
                  color: form.winner === p ? 'white' : 'var(--text-primary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all .15s',
                }}>
                  {p.split(' ').pop()}
                </button>
              ))}
            </div>

            {/* Sets por set */}
            {form.winner && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Resultado por set (opcional)
                  <span style={{ color: '#C9A84C', fontWeight: 700, marginLeft: 4 }}>+3 pts</span>
                </div>

                {/* Labels de jugadores */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}></div>
                  {['S1','S2','S3','S4','S5'].map(s => (
                    <div key={s} style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>{s}</div>
                  ))}
                </div>

                {/* Fila ganador */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: G, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    {form.winner.split(' ').pop()}
                  </div>
                  {form.sets.map((s, i) => (
                    <input key={i} type="number" min="0" max="7" value={s.w}
                      onChange={e => setSetScore(i, 'w', e.target.value)}
                      style={{
                        height: 32, border: `0.5px solid ${s.w !== '' ? G : BORDER}`,
                        borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 600,
                        background: s.w !== '' ? '#E8F5E9' : 'var(--surface-2)',
                        color: s.w !== '' ? G : 'var(--text-muted)',
                        width: '100%', padding: 0, outline: 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Fila perdedor */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(5, 1fr)', gap: 4, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {(form.winner === match.player1 ? match.player2 : match.player1).split(' ').pop()}
                  </div>
                  {form.sets.map((s, i) => (
                    <input key={i} type="number" min="0" max="7" value={s.l}
                      onChange={e => setSetScore(i, 'l', e.target.value)}
                      style={{
                        height: 32, border: `0.5px solid ${BORDER}`,
                        borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 600,
                        background: 'var(--surface-2)', color: 'var(--text-secondary)',
                        width: '100%', padding: 0, outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => submit(editing)} disabled={busy} style={{
                flex: 1, padding: '12px', background: G, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                {busy ? 'Guardando...' : editing ? 'Guardar corrección' : 'Guardar pronóstico'}
              </button>
              {editing && (
                <button onClick={() => setEditing(false)} style={{
                  padding: '12px 16px', background: 'none', color: 'var(--text-secondary)',
                  border: `0.5px solid ${BORDER}`, borderRadius: 8, fontSize: 13, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}