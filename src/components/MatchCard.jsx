import React, { useState, useEffect } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G      = 'var(--green)'
const GM     = 'var(--green-mid)'
const BORDER = 'var(--border)'

const emptySet = () => ({ w: '', l: '' })

// ── Modal "Ver pronóstico detallado" ─────────────────────────────────────────
function PickDetailModal({ match, pick, onClose }) {
  const res = match.result

  const pickSets = pick ? [1,2,3,4,5].map(i => ({
    w: pick[`set${i}W`], l: pick[`set${i}L`]
  })).filter(s => s.w != null) : []

  const resSets = res ? [1,2,3,4,5].map(i => ({
    w: res[`set${i}W`], l: res[`set${i}L`]
  })).filter(s => s.w != null) : []

  const winnerOk = pick && res && pick.winner?.toLowerCase() === res.winner?.toLowerCase()
  const setsOk   = winnerOk && pick.setsWinner != null && pick.setsWinner === res.setsWinner
  const exactOk  = pick?.pointsEarned >= 14
  const pts      = pick?.pointsEarned || 0

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      zIndex: 500, display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card-bg)', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, margin: '0 auto',
        padding: '18px 18px 40px',
        maxHeight: '88vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, background: BORDER, borderRadius: 4, margin: '0 auto 14px' }} />

        <div style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
          {match.player1} vs {match.player2}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {match.court} · {match.matchTime?.slice(0,5)} hs
        </div>

        {pts > 0 ? (
          <>
            <div style={{ fontSize: 40, fontWeight: 700, color: G, textAlign: 'center', marginBottom: 2 }}>
              +{pts}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16 }}>
              puntos ganados
            </div>
          </>
        ) : (
          <div style={{
            background: 'var(--danger-bg)', borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: 'var(--danger)', fontWeight: 600, textAlign: 'center', marginBottom: 16,
          }}>
            Sin puntos en este partido
          </div>
        )}

        {res && (
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Resultado real</span>
            <span style={{ fontWeight: 600 }}>{res.gameResult || `${res.winner} (${res.setsWinner} sets)`}</span>
          </div>
        )}

        <div style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>Tu ganador</span>
          <span style={{ fontWeight: 600, color: winnerOk ? G : 'var(--danger)' }}>
            {winnerOk ? '✓' : '✗'} {pick?.winner}
          </span>
        </div>

        {pickSets.length > 0 && (
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: 12 }}>Sets pronosticados</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {pickSets.map((s, i) => (
                <span key={i} style={{
                  background: 'var(--green-light)', borderRadius: 4,
                  padding: '3px 8px', fontSize: 12, fontWeight: 700, color: G,
                }}>{s.w}-{s.l}</span>
              ))}
            </div>
          </div>
        )}

        {resSets.length > 0 && (
          <div style={{ padding: '9px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginRight: 12 }}>Sets reales</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {resSets.map((s, i) => (
                <span key={i} style={{
                  background: G, color: 'var(--card-bg)', borderRadius: 4,
                  padding: '3px 8px', fontSize: 12, fontWeight: 700,
                }}>{s.w}-{s.l}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '9px 0', fontSize: 13 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Desglose</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{winnerOk ? '✓' : '✗'} Ganador correcto</span>
              <span style={{ fontWeight: 600, color: winnerOk ? G : 'var(--text-muted)' }}>{winnerOk ? '+1' : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{setsOk ? '✓' : '✗'} Sets ganados ({pick?.setsWinner ?? '—'} sets)</span>
              <span style={{ fontWeight: 600, color: setsOk ? G : 'var(--text-muted)' }}>{setsOk ? '+3' : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{exactOk ? '✓' : '✗'} Resultado exacto set a set</span>
              <span style={{ fontWeight: 600, color: exactOk ? G : 'var(--text-muted)' }}>{exactOk ? '+10' : '0'}</span>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: 11, background: 'var(--cream)', color: 'var(--text-mid)',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', marginTop: 16,
        }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ── Match Card principal ──────────────────────────────────────────────────────
export default function MatchCard({ match, status, onRefresh }) {
  const { show }              = useToast()
  const [busy, setBusy]       = useState(false)
  const [editing, setEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const pick = match.myPick
  const res  = match.result

  // Calcular deadline
  // Deadline: si el admin lo forzó → siempre cerrado. Sino, calcular.
  const deadline = (() => {
    if (match.deadlineForced) return new Date(0)  // ya cerró

    // usar estimatedStartTime si viene, si no matchTime
    const timeSource = match.estimatedStartTime || match.matchTime
    if (!timeSource) return new Date(8640000000000000)  // fecha lejana = abierto

    const d = new Date(`${match.matchDate}T${timeSource}`)
    d.setMinutes(d.getMinutes() - 5)
    return d
  })()

  const fmtDeadline = deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  // Estado reactivo del cierre — se recalcula cada 30 segundos
  const [closed, setClosed] = useState(new Date() > deadline)

  useEffect(() => {
    // Recalcular inmediatamente
    setClosed(new Date() > deadline)

    const interval = setInterval(() => {
      const nowClosed = new Date() > deadline
      setClosed(nowClosed)
    }, 30_000)

    return () => clearInterval(interval)
  }, [deadline.getTime()])

  // Cuando cierra el plazo, colapsar el formulario si estaba abierto
  useEffect(() => {
    if (closed && editing) {
      setEditing(false)
      show('El plazo de pronóstico cerró.', 'error')
    }
  }, [closed])

  const [form, setForm] = useState({
    winner: pick?.winner || '',
    sets: [emptySet(), emptySet(), emptySet(), emptySet(), emptySet()],
  })

  const setWinner   = v => setForm(f => ({ ...f, winner: v }))
  const setSetScore = (idx, side, val) => setForm(f => {
    const sets = f.sets.map((s, i) => i === idx ? { ...s, [side]: val } : s)
    return { ...f, sets }
  })

  const countSetsWinner = () => {
    let cnt = 0
    form.sets.forEach(s => {
      if (s.w !== '' && s.l !== '') {
        const w = parseInt(s.w), l = parseInt(s.l)
        if (!isNaN(w) && !isNaN(l) && w > l) cnt++
      }
    })
    return cnt > 0 ? cnt : null
  }

  const submit = async (useCorrection = false) => {
    if (!form.winner) { show('Elegí un ganador.', 'error'); return }

    // Bloqueo en frontend antes de llamar al backend
    if (closed && !useCorrection) {
      show('El plazo de pronóstico ya cerró.', 'error')
      return
    }

    setBusy(true)
    try {
      const payload = {
        winner: form.winner,
        setsWinner: countSetsWinner(),
        gamesWinner: null,
        gamesLoser: null,
        useCorrection,
      }
      form.sets.forEach((s, i) => {
        const n = i + 1
        payload[`set${n}W`] = s.w !== '' ? parseInt(s.w) : null
        payload[`set${n}L`] = s.l !== '' ? parseInt(s.l) : null
      })
      await api.post(`/matches/${match.id}/pick`, payload)
      show(useCorrection ? 'Corrección guardada ✓' : 'Pronóstico guardado ✓')
      setEditing(false)
      onRefresh()
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar.', 'error')
    } finally { setBusy(false) }
  }

  const startEdit = () => {
    if (closed) { show('El plazo ya cerró, no podés corregir.', 'error'); return }
    const savedSets = [1,2,3,4,5].map(i => ({
      w: pick?.[`set${i}W`] != null ? String(pick[`set${i}W`]) : '',
      l: pick?.[`set${i}L`] != null ? String(pick[`set${i}L`]) : '',
    }))
    setForm({ winner: pick?.winner || '', sets: savedSets })
    setEditing(true)
  }

  // Mostrar formulario solo si: no hay pick YA y no cerró, o está editando
  const showForm = (!pick && !closed) || editing

  // Cuadraditos de score
  const resultSets = (() => {
    if (!res) return null
    const arr = []
    for (let i = 1; i <= 5; i++) {
      const w = res[`set${i}W`], l = res[`set${i}L`]
      if (w != null && l != null) arr.push({ w, l })
    }
    return arr.length > 0 ? arr : null
  })()

  const ScoreBoxes = ({ isWinner }) => (
    <div style={{ display: 'flex', gap: 3 }}>
      {[0,1,2,3,4].map(i => {
        if (status === 'jugando' && !resultSets?.[i]) {
          return (
            <div key={i} style={{
              width: 20, height: 20, border: `1px solid var(--gold)`,
              borderRadius: 3, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, fontWeight: 700,
              background: 'var(--gold-bg)', color: 'var(--gold)',
            }}>·</div>
          )
        }
        if (!resultSets?.[i]) {
          return (
            <div key={i} style={{
              width: 20, height: 20, border: `1px solid ${BORDER}`,
              borderRadius: 3, fontSize: 10, color: 'var(--text-muted)', background: 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>·</div>
          )
        }
        const score       = isWinner ? resultSets[i].w : resultSets[i].l
        const ganóEsteSet = isWinner
          ? resultSets[i].w > resultSets[i].l
          : resultSets[i].l > resultSets[i].w
        return (
          <div key={i} style={{
            width: 20, height: 20,
            border: `1px solid ${ganóEsteSet ? G : BORDER}`,
            borderRadius: 3, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 10, fontWeight: 700,
            background: ganóEsteSet ? G : 'var(--cream)',
            color: ganóEsteSet ? 'var(--card-bg)' : 'var(--text-muted)',
          }}>{score}</div>
        )
      })}
    </div>
  )

  const winnerOk = pick && res && pick.winner?.toLowerCase() === res.winner?.toLowerCase()
  const pts      = pick?.pointsEarned || 0

  return (
    <>
      <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>

        {/* Header verde */}
        <div style={{
          background: G, padding: '7px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)' }}>
            {match.matchTime?.slice(0,5)} hs
          </span>
          <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>
            {match.court || 'Wimbledon'}
          </span>
          {match.round && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{match.round  || 'Round'}</span>
          )}
        </div>

        {/* Badge LIVE */}
        {status === 'jugando' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 12px', background: 'var(--danger-bg)', borderBottom: `0.5px solid var(--danger)`,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>En curso</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              color: 'var(--danger)', fontSize: 9, fontWeight: 700,
              padding: '2px 7px', borderRadius: 20, background: 'var(--danger-bg)',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)',
                animation: 'pulse .8s infinite',
              }} />
              LIVE
            </span>
          </div>
        )}

        {/* Banner cierre — solo para partidos por jugar */}
        {status === 'por_jugar' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 12px',
            background: closed ? 'var(--danger-bg)' : 'var(--cream)',
            borderBottom: `0.5px solid ${closed ? 'var(--danger)' : BORDER}`,
            transition: 'background .3s',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cierre de pronóstico</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: closed ? 'var(--danger)' : 'var(--text)' }}>
                {fmtDeadline} hs
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: closed ? 'var(--danger)' : 'var(--green-mid)',
              color: closed ? 'var(--danger)' : G,
              transition: 'all .3s',
            }}>
              {closed ? 'Cerrado' : 'Abierto'}
            </span>
          </div>
        )}

        {/* Jugadores */}
        <div style={{ padding: '11px 12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: res?.winner === match.player1 ? G : 'var(--text)' }}>
              {match.player1}{res?.winner === match.player1 ? ' ✓' : ''}
            </span>
            <ScoreBoxes isWinner={res?.winner === match.player1} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '1px 0', fontWeight: 700, letterSpacing: '.05em' }}>VS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: res?.winner === match.player2 ? G : 'var(--text)' }}>
              {match.player2}{res?.winner === match.player2 ? ' ✓' : ''}
            </span>
            <ScoreBoxes isWinner={res?.winner === match.player2} />
          </div>
        </div>

        {/* Pick zone */}
        <div style={{ padding: '10px 12px 12px', borderTop: `1px dashed ${BORDER}`, marginTop: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: GM, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
            Tu pronóstico
          </div>

          {/* ── TERMINADO ── */}
          {status === 'terminado' && (
            pick ? (
              <>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{
                    flex: 1, background: winnerOk ? 'var(--green-pale)' : 'var(--danger-bg)',
                    border: `1px solid ${winnerOk ? 'var(--green-mid)' : 'var(--danger)'}`,
                    borderRadius: 6, padding: '7px 10px', fontSize: 12,
                    color: winnerOk ? G : 'var(--danger)', fontWeight: 600,
                  }}>
                    {winnerOk ? '✓' : '✗'} {pick.winner}
                    {pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
                  </div>
                  <span style={{
                    background: pts > 0 ? G : 'var(--border)',
                    color: pts > 0 ? 'var(--card-bg)' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700, padding: '4px 10px',
                    borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {pts > 0 ? `+${pts} pts` : '0 pts'}
                  </span>
                </div>
                <button onClick={() => setShowModal(true)} style={{
                  width: '100%', padding: '8px', background: 'var(--card-bg)',
                  color: G, border: `1px solid var(--green-mid)`, borderRadius: 7,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  Ver pronóstico detallado
                </button>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No enviaste pronóstico</p>
            )
          )}

          {/* ── EN JUEGO ── */}
          {status === 'jugando' && (
            pick ? (
              <div style={{
                background: 'var(--green-pale)', border: '1px solid var(--green-mid)',
                borderRadius: 6, padding: '7px 10px', fontSize: 12,
                color: G, fontWeight: 600, display: 'flex', justifyContent: 'space-between',
              }}>
                🏆 {pick.winner}{pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
                <span style={{
                  background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold)',
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                }}>En juego</span>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No enviaste pronóstico</p>
            )
          )}

          {/* ── POR JUGAR ── */}
          {status === 'por_jugar' && (
            <>
              {/* Pick guardado y no editando */}
              {pick && !showForm && (
                <>
                  <div style={{
                    background: 'var(--green-pale)', border: '1px solid var(--green-mid)',
                    borderRadius: 6, padding: '7px 10px', fontSize: 12,
                    color: G, fontWeight: 600, marginBottom: 6,
                  }}>
                    🏆 {pick.winner}{pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
                    {pick.isCorrection && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>(corrección)</span>}
                  </div>
                  {/* Botón corrección solo si plazo abierto */}
                  {!closed && (
                    <button onClick={startEdit} style={{
                      width: '100%', padding: '8px', background: 'var(--card-bg)',
                      border: `1px dashed ${GM}`, borderRadius: 7,
                      color: GM, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      ↺ Usar corrección del día
                    </button>
                  )}
                  {/* Aviso si ya cerró */}
                  {closed && (
                    <div style={{
                      fontSize: 11, color: 'var(--danger)', textAlign: 'center',
                      padding: '5px 0', fontWeight: 500,
                    }}>
                      Plazo cerrado · pronóstico guardado
                    </div>
                  )}
                </>
              )}

              {/* Sin pick y cerrado */}
              {!pick && closed && (
                <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>
                  Plazo cerrado · No enviaste pronóstico
                </p>
              )}

              {/* Formulario — solo si está abierto o editando */}
              {showForm && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Ganador</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[match.player1, match.player2].map(p => (
                      <button key={p} onClick={() => setWinner(p)} style={{
                        flex: 1, padding: '9px 6px',
                        border: `1px solid ${form.winner === p ? G : BORDER}`,
                        borderRadius: 7,
                        background: form.winner === p ? G : 'white',
                        color: form.winner === p ? 'white' : 'var(--text)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>
                        {p.split(' ').pop()}
                      </button>
                    ))}
                  </div>

                  {form.winner && (
                    <>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Resultado por set (opcional)
                        <span style={{ color: 'var(--gold)', fontWeight: 700, marginLeft: 4 }}>+10 pts</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                        <div />
                        {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                          <div key={s} style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>{s}</div>
                        ))}
                      </div>
                      {['w','l'].map((side) => (
                        <div key={side} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 600,
                            color: side === 'w' ? G : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', overflow: 'hidden',
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {side === 'w'
                                ? form.winner.split(' ').pop()
                                : (form.winner === match.player1 ? match.player2 : match.player1).split(' ').pop()}
                            </span>
                          </div>
                          {form.sets.map((s, i) => (
                            <input key={i} type="number" min="0" max="7" value={s[side]}
                              onChange={e => setSetScore(i, side, e.target.value)}
                              style={{
                                height: 32, borderRadius: 5, textAlign: 'center',
                                fontSize: 13, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
                                border: `0.5px solid ${s[side] !== '' && side === 'w' ? G : BORDER}`,
                                background: s[side] !== '' && side === 'w' ? 'var(--green-light)' : 'var(--cream)',
                                color: s[side] !== '' ? (side === 'w' ? G : 'var(--text-mid)') : 'var(--text-muted)',
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => submit(editing)} disabled={busy || closed} style={{
                      flex: 1, padding: '12px', background: busy || closed ? 'var(--text-muted)' : G,
                      color: 'var(--card-bg)', border: 'none', borderRadius: 7,
                      fontSize: 13, fontWeight: 600,
                      cursor: busy || closed ? 'not-allowed' : 'pointer',
                    }}>
                      {busy ? 'Guardando...' : closed ? 'Plazo cerrado' : editing ? 'Guardar corrección' : 'Guardar pronóstico'}
                    </button>
                    <button onClick={() => { setEditing(false); setForm({ winner: pick?.winner || '', sets: [emptySet(),emptySet(),emptySet(),emptySet(),emptySet()] }) }} style={{
                      padding: '12px 14px', background: 'none', color: 'var(--text-muted)',
                      border: `0.5px solid ${BORDER}`, borderRadius: 7, fontSize: 12, cursor: 'pointer',
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <PickDetailModal match={match} pick={pick} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}