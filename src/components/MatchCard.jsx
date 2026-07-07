import React, { useState, useEffect } from 'react'
import { api, useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Confetti from './Confetti.jsx'

// ── Dark Centre Court + Green Line tokens ──
const C = {
  bg:         'rgba(255,255,255,.05)',
  bgHover:    'rgba(255,255,255,.08)',
  green:      '#4CAF50',
  greenMid:   'rgba(76,175,80,.35)',
  greenDark:  '#1B5E20',
  greenPale:  'rgba(76,175,80,.1)',
  greenLine:  '#4CAF50',
  border:     'rgba(255,255,255,.06)',
  borderMid:  'rgba(255,255,255,.12)',
  text:       '#fff',
  textMuted:  'rgba(255,255,255,.35)',
  textMid:    'rgba(255,255,255,.6)',
  gold:       '#C8A951',
  goldBg:     'rgba(200,169,81,.12)',
  danger:     '#f44336',
  dangerBg:   'rgba(244,67,54,.1)',
  orange:     '#E65100',
  orangeBg:   'rgba(230,81,0,.1)',
  cream:      'rgba(255,255,255,.04)',
  inputBg:    'rgba(255,255,255,.06)',
}

const emptySet = () => ({ w: '', l: '' })

// ── Modal "Ver pronóstico detallado" ─────────────────────────────────────────
function PickDetailModal({ match, pick, onClose }) {
  const res = match.result

  const pickSets = pick ? [1,2,3,4,5].map(i => ({
    w: pick[`set${i}W`], l: pick[`set${i}L`]
  })).filter(s => s.w != null && s.w > 0) : []

  const resSets = res ? [1,2,3,4,5].map(i => ({
    w: res[`set${i}W`], l: res[`set${i}L`]
  })).filter(s => s.w != null && s.w > 0) : []

  const winnerOk = pick && res && pick.winner?.toLowerCase() === res.winner?.toLowerCase()
  const setsOk   = winnerOk && pick.setsWinner != null && pick.setsWinner === res.setsWinner
                    && pick.setsLoser != null && pick.setsLoser === res.setsLoser
  const exactOk  = pick?.pointsEarned >= 14
  const pts      = pick?.pointsEarned || 0

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
      zIndex: 500, display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#141e17', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 430, margin: '0 auto',
        padding: '18px 18px 40px',
        maxHeight: '88vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, background: C.borderMid, borderRadius: 4, margin: '0 auto 14px' }} />

        <div style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, marginBottom: 2, color: C.text }}>
          {match.player1} vs {match.player2}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
          {match.court} · {match.matchTime?.slice(0,5)} hs
        </div>

        {pts > 0 ? (
          <>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.green, textAlign: 'center', marginBottom: 2 }}>
              +{pts}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', marginBottom: 16 }}>
              puntos ganados
            </div>
          </>
        ) : (
          <div style={{
            background: C.dangerBg, borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: C.danger, fontWeight: 600, textAlign: 'center', marginBottom: 16,
          }}>
            Sin puntos en este partido
          </div>
        )}

        {res && (
          <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: C.textMuted }}>Resultado real</span>
            <span style={{ fontWeight: 600, color: C.text }}>{res.gameResult || `${res.winner} (${res.setsWinner} sets)`}</span>
          </div>
        )}

        <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: C.textMuted }}>Tu ganador</span>
          <span style={{ fontWeight: 600, color: winnerOk ? C.green : C.danger }}>
            {winnerOk ? '✓' : '✗'} {pick?.winner}
          </span>
        </div>

        {pickSets.length > 0 && (
          <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ color: C.textMuted, flexShrink: 0, marginRight: 12 }}>Sets pronosticados</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {pickSets.map((s, i) => (
                <span key={i} style={{
                  background: C.greenPale, borderRadius: 4,
                  padding: '3px 8px', fontSize: 12, fontWeight: 700, color: C.green,
                }}>{s.w}-{s.l}</span>
              ))}
            </div>
          </div>
        )}

        {resSets.length > 0 && (
          <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ color: C.textMuted, flexShrink: 0, marginRight: 12 }}>Sets reales</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {resSets.map((s, i) => (
                <span key={i} style={{
                  background: C.green, color: '#0a1a0f', borderRadius: 4,
                  padding: '3px 8px', fontSize: 12, fontWeight: 700,
                }}>{s.w}-{s.l}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '9px 0', fontSize: 13 }}>
          <div style={{ color: C.textMuted, marginBottom: 6 }}>Desglose</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
              <span>{winnerOk ? '✓' : '✗'} Ganador correcto</span>
              <span style={{ fontWeight: 600, color: winnerOk ? C.green : C.textMuted }}>{winnerOk ? '+1' : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
              <span>{setsOk ? '✓' : '✗'} Sets ganados ({pick?.setsWinner ?? '—'} sets)</span>
              <span style={{ fontWeight: 600, color: setsOk ? C.green : C.textMuted }}>{setsOk ? '+3' : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textMid }}>
              <span>{exactOk ? '✓' : '✗'} Exacto</span>
              <span style={{ fontWeight: 600, color: exactOk ? C.green : C.textMuted }}>{exactOk ? '+10' : '0'}</span>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: 14, marginTop: 20, border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', background: C.greenDark, color: C.text,
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
  const [confettiKey, setConfettiKey] = useState(0)
  const prevPtsRef = React.useRef(0)

  const { user: authUser } = useAuth()
  const isAdmin = authUser?.role === 'ADMIN'
  const pick = match.myPick
  const res  = match.result

  // Detectar si el usuario acaba de recibir puntos
  const currentPts = pick?.pointsEarned || 0
  useEffect(() => {
    if (prevPtsRef.current === 0 && currentPts > 0 && status === 'terminado') {
      setConfettiKey(k => k + 1)
    }
    prevPtsRef.current = currentPts
  }, [currentPts, status])

  const closed = match.deadlineForced === true

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
    if (closed) {
      show('El plazo ya cerró, usá la corrección del día si no la usaste.', 'error')
      return
    }
    const savedSets = [1,2,3,4,5].map(i => ({
      w: pick?.[`set${i}W`] != null ? String(pick[`set${i}W`]) : '',
      l: pick?.[`set${i}L`] != null ? String(pick[`set${i}L`]) : '',
    }))
    setForm({ winner: pick?.winner || '', sets: savedSets })
    setEditing(true)
  }

  const showForm = status !== 'jugando' && status !== 'suspendido' && ((!pick && !closed) || editing)
  const canCorrect = status !== 'jugando' && status !== 'suspendido' && closed && pick && !pick.isCorrection && status !== 'terminado'

  // Score boxes
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
              width: 20, height: 20, border: `1px solid ${C.gold}`,
              borderRadius: 3, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 10, fontWeight: 700,
              background: C.goldBg, color: C.gold,
            }}>·</div>
          )
        }
        if (!resultSets?.[i]) {
          return (
            <div key={i} style={{
              width: 20, height: 20, border: `1px solid ${C.border}`,
              borderRadius: 3, fontSize: 10, color: C.textMuted, background: C.cream,
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
            border: `1px solid ${ganóEsteSet ? C.green : C.border}`,
            borderRadius: 3, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 10, fontWeight: 700,
            background: ganóEsteSet ? C.green : C.cream,
            color: ganóEsteSet ? '#0a1a0f' : C.textMuted,
          }}>{score}</div>
        )
      })}
    </div>
  )

  const winnerOk = pick && res && pick.winner?.toLowerCase() === res.winner?.toLowerCase()
  const pts      = pick?.pointsEarned || 0

  // Determine left border color (green line style)
  const leftBorder = status === 'jugando' ? C.greenLine
    : status === 'suspendido' ? C.orange
    : status === 'terminado' ? C.borderMid
    : C.border

  const inputStyle = {
    height: 32, borderRadius: 6, textAlign: 'center',
    fontSize: 13, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
    border: `1px solid ${C.borderMid}`,
    background: C.inputBg,
    color: C.text,
  }

  return (
    <>
      <div style={{
        marginBottom: 8, padding: 0, overflow: 'hidden',
        background: C.bg,
        borderLeft: `3px solid ${leftBorder}`,
        borderRadius: '0 12px 12px 0',
      }}>

        {/* Top bar: court + time */}
        <div style={{
          padding: '7px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: '.05em' }}>
            {match.court || 'Wimbledon'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {match.round && (
              <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: '.04em' }}>{match.round}</span>
            )}
            <span style={{ fontSize: 10, color: C.textMuted }}>
              {match.matchTime?.slice(0,5)} hs
            </span>
          </div>
        </div>

        {/* Badge LIVE */}
        {status === 'jugando' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 14px', background: C.dangerBg, borderBottom: `1px solid rgba(244,67,54,.15)`,
          }}>
            <span style={{ fontSize: 10, color: C.textMuted }}>En curso</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              color: C.danger, fontSize: 9, fontWeight: 700,
              padding: '2px 7px', borderRadius: 20, background: C.dangerBg,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: C.danger,
                animation: 'pulse .8s infinite',
              }} />
              LIVE
            </span>
          </div>
        )}

        {/* Badge SUSPENDIDO */}
        {status === 'suspendido' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 14px', background: C.orangeBg, borderBottom: `1px solid rgba(230,81,0,.15)`,
          }}>
            <span style={{ fontSize: 10, color: C.textMuted }}>Suspendido</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              color: C.orange, fontSize: 9, fontWeight: 700,
              padding: '2px 7px', borderRadius: 20, background: C.orangeBg,
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="2" width="12" height="20" rx="2" />
              </svg>
              SUSPENDIDO
            </span>
          </div>
        )}

        {/* Banner cierre */}
        {closed && status === 'por_jugar' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 14px',
            background: C.dangerBg,
            borderBottom: `1px solid rgba(244,67,54,.15)`,
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted }}>Cierre de pronóstico</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.danger }}>Cerrado</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: C.danger, color: C.text,
            }}>
              Cerrado
            </span>
          </div>
        )}

        {/* Jugadores */}
        <div style={{ padding: '11px 14px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: res?.winner === match.player1 ? C.green : C.text }}>
              {match.player1}{res?.winner === match.player1 ? ' ✓' : ''}
            </span>
            <ScoreBoxes isWinner={res?.winner ? res.winner === match.player1 : true} />
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', padding: '1px 0', fontWeight: 700, letterSpacing: '.05em' }}>VS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: res?.winner === match.player2 ? C.green : C.text }}>
              {match.player2}{res?.winner === match.player2 ? ' ✓' : ''}
            </span>
            <ScoreBoxes isWinner={res?.winner ? res.winner === match.player2 : false} />
          </div>
        </div>

        {/* Pick zone — ocultar para admin */}
        {!isAdmin && (
        <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.greenMid, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
            Tu pronóstico
          </div>

          {/* ── TERMINADO ── */}
          {status === 'terminado' && (
            pick ? (
              <>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{
                    flex: 1, background: winnerOk ? C.greenPale : C.dangerBg,
                    border: `1px solid ${winnerOk ? C.green : C.danger}`,
                    borderRadius: 6, padding: '7px 10px', fontSize: 12,
                    color: winnerOk ? C.green : C.danger, fontWeight: 600,
                  }}>
                    {winnerOk ? '✓' : '✗'} {pick.winner}
                    {pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
                    {pick.isCorrection && <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 6 }}>(corrección)</span>}
                  </div>
                  <span style={{
                    background: pts > 0 ? C.green : C.borderMid,
                    color: pts > 0 ? '#0a1a0f' : C.textMuted,
                    fontSize: 11, fontWeight: 700, padding: '4px 10px',
                    borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {pts > 0 ? `+${pts} pts` : '0 pts'}
                  </span>
                </div>
                <button onClick={() => setShowModal(true)} style={{
                  width: '100%', padding: '8px', background: 'transparent',
                  color: C.green, border: `1px solid ${C.greenMid}`, borderRadius: 7,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  Ver pronóstico detallado
                </button>
              </>
            ) : (
              <p style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No enviaste pronóstico</p>
            )
          )}

          {/* ── EN JUEGO ── */}
          {status === 'jugando' && (
            pick ? (
              <>
                <div style={{
                  background: C.greenPale, border: `1px solid ${C.greenMid}`,
                  borderRadius: 6, padding: '7px 10px', fontSize: 12,
                  color: C.green, fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                }}>
                  <span>{pick.winner}{pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}</span>
                  <span style={{
                    background: C.goldBg, color: C.gold, border: `1px solid rgba(200,169,81,.25)`,
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                  }}>En juego</span>
                </div>
                {canCorrect && (
                  <button onClick={() => {
                    const savedSets = [1,2,3,4,5].map(i => ({
                      w: pick?.[`set${i}W`] != null ? String(pick[`set${i}W`]) : '',
                      l: pick?.[`set${i}L`] != null ? String(pick[`set${i}L`]) : '',
                    }))
                    setForm({ winner: pick?.winner || '', sets: savedSets })
                    setEditing(true)
                  }} style={{
                    width: '100%', padding: '8px', background: 'transparent',
                    border: `1px dashed ${C.greenMid}`, borderRadius: 7,
                    color: C.greenMid, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>
                    ↺ Usar corrección del día
                  </button>
                )}
              </>
            ) : (
              <p style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No enviaste pronóstico</p>
            )
          )}

          {/* ── POR JUGAR ── */}
          {status === 'por_jugar' && (
            <>
              {pick && !showForm && (
                <>
                  <div style={{
                    background: C.greenPale, border: `1px solid ${C.greenMid}`,
                    borderRadius: 6, padding: '7px 10px', fontSize: 12,
                    color: C.green, fontWeight: 600, marginBottom: 6,
                  }}>
                    {pick.winner}{pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
                    {pick.isCorrection && <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 6 }}>(corrección)</span>}
                  </div>
                  {!closed && (
                    <button onClick={startEdit} style={{
                      width: '100%', padding: '8px', background: 'transparent',
                      border: `1px dashed ${C.greenMid}`, borderRadius: 7,
                      color: C.greenMid, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      ↺ Usar corrección del día
                    </button>
                  )}
                  {closed && (
                    <div style={{
                      fontSize: 11, color: C.danger, textAlign: 'center',
                      padding: '5px 0', fontWeight: 500,
                    }}>
                      Plazo cerrado · pronóstico guardado
                    </div>
                  )}
                </>
              )}

              {!pick && closed && (
                <p style={{ fontSize: 12, color: C.danger, fontWeight: 500 }}>
                  Plazo cerrado · No enviaste pronóstico
                </p>
              )}

              {showForm && (
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Ganador</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[match.player1, match.player2].map(p => (
                      <button key={p} onClick={() => setWinner(p)} style={{
                        flex: 1, padding: '9px 6px',
                        border: `1px solid ${form.winner === p ? C.green : C.borderMid}`,
                        borderRadius: 7,
                        background: form.winner === p ? C.green : C.inputBg,
                        color: form.winner === p ? '#0a1a0f' : C.text,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all .15s',
                      }}>
                        {p.split(' ').pop()}
                      </button>
                    ))}
                  </div>

                  {form.winner && (
                    <>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>
                        Resultado por set (opcional)
                        <span style={{ color: C.gold, fontWeight: 700, marginLeft: 4 }}>+10 pts</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                        <div />
                        {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                          <div key={s} style={{ fontSize: 9, color: C.textMuted, textAlign: 'center', fontWeight: 600 }}>{s}</div>
                        ))}
                      </div>
                      {['w','l'].map((side) => (
                        <div key={side} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 600,
                            color: side === 'w' ? C.green : C.textMuted,
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
                                ...inputStyle,
                                borderColor: s[side] !== '' && side === 'w' ? C.green : C.borderMid,
                                background: s[side] !== '' && side === 'w' ? C.greenPale : C.inputBg,
                                color: s[side] !== '' ? (side === 'w' ? C.green : C.textMid) : C.textMuted,
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => submit(editing)} disabled={busy} style={{
                      flex: 1, padding: '12px', background: busy ? C.textMuted : C.green,
                      color: '#0a1a0f', border: 'none', borderRadius: 7,
                      fontSize: 13, fontWeight: 700,
                      cursor: busy ? 'not-allowed' : 'pointer',
                      transition: 'all .15s',
                    }}>
                      {busy ? 'Guardando...' : editing ? 'Guardar corrección' : 'Guardar pronóstico'}
                    </button>
                    <button onClick={() => { setEditing(false); setForm({ winner: pick?.winner || '', sets: [emptySet(),emptySet(),emptySet(),emptySet(),emptySet()] }) }} style={{
                      padding: '12px 14px', background: 'transparent', color: C.textMuted,
                      border: `1px solid ${C.borderMid}`, borderRadius: 7, fontSize: 12, cursor: 'pointer',
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        )}
      </div>

      {showModal && (
        <PickDetailModal match={match} pick={pick} onClose={() => setShowModal(false)} />
      )}

      <Confetti trigger={confettiKey} />
    </>
  )
}