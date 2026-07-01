import React, { useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G = '#1B5E20'
const GM = '#2E7D32'
const BORDER = '#E0E0D8'

const emptySet = () => ({ w: '', l: '' })

export default function MatchCard({ match, onRefresh }) {
  const { show } = useToast()
  const [busy, setBusy]       = useState(false)
  const [editing, setEditing] = useState(false)

  const pick = match.myPick
  const res  = match.result

  const [form, setForm] = useState({
    winner: pick?.winner || '',
    sets: [emptySet(), emptySet(), emptySet(), emptySet(), emptySet()],
  })

  const deadline = (() => {
    const d = new Date(`${match.matchDate}T${match.matchTime}`)
    d.setMinutes(d.getMinutes() - 5)
    return d
  })()
  const closed     = new Date() > deadline
  const fmtDeadline = deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const setWinner = v => setForm(f => ({ ...f, winner: v }))
  const setSetScore = (idx, side, val) => setForm(f => {
    const sets = f.sets.map((s, i) => i === idx ? { ...s, [side]: val } : s)
    return { ...f, sets }
  })

  // Parsear resultado real por set del backend
  const resultSets = (() => {
    if (!res) return null
    const arr = []
    for (let i = 1; i <= 5; i++) {
      const w = res[`set${i}W`]
      const l = res[`set${i}L`]
      if (w != null && l != null) arr.push({ w, l })
    }
    return arr.length > 0 ? arr : null
  })()

  // Calcular sets ganados según form
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
    setBusy(true)
    try {
      const payload = {
        winner: form.winner,
        setsWinner: countSetsWinner(),
        gamesWinner: null,
        gamesLoser: null,
        useCorrection,
      }
      // Agregar sets individuales
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
    // Cargar sets guardados en el form
    const savedSets = [1,2,3,4,5].map(i => ({
      w: pick?.[`set${i}W`] != null ? String(pick[`set${i}W`]) : '',
      l: pick?.[`set${i}L`] != null ? String(pick[`set${i}L`]) : '',
    }))
    setForm({ winner: pick?.winner || '', sets: savedSets })
    setEditing(true)
  }

  const showForm = (!pick && !closed) || editing

  // Marcador por set
  const ScoreBoxes = ({ isWinner }) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0,1,2,3,4].map(i => {
        if (!resultSets || !resultSets[i]) {
          return (
            <div key={i} style={{
              width: 22, height: 22, border: `0.5px solid ${BORDER}`,
              borderRadius: 4, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11,
              background: '#FAFAF7', color: '#ccc'
            }}>·</div>
          )
        }
        const score   = isWinner ? resultSets[i].w : resultSets[i].l
        const ganóEsteSet = isWinner
          ? resultSets[i].w > resultSets[i].l
          : resultSets[i].l > resultSets[i].w
        return (
          <div key={i} style={{
            width: 22, height: 22,
            border: `0.5px solid ${ganóEsteSet ? G : BORDER}`,
            borderRadius: 4, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, fontWeight: 700,
            background: ganóEsteSet ? G : '#FAFAF7',
            color: ganóEsteSet ? '#fff' : '#888',
          }}>{score}</div>
        )
      })}
    </div>
  )

  return (
    <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
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
        padding: '7px 14px', background: '#FAFAF7',
        borderBottom: `0.5px solid ${BORDER}`,
      }}>
        <div>
          <div style={{ fontSize: 10, color: '#888' }}>Cierre de pronóstico</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{fmtDeadline} hs</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: closed ? '#FFCDD2' : '#C8E6C9',
          color: closed ? '#B71C1C' : '#1B5E20',
        }}>
          {closed ? 'Cerrado' : 'Abierto'}
        </span>
      </div>

      {/* Jugadores con marcador por set */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{match.player1}</span>
          <ScoreBoxes isWinner={res?.winner === match.player1} />
        </div>
        <div style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: '2px 0', fontWeight: 600, letterSpacing: '.05em' }}>VS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{match.player2}</span>
          <ScoreBoxes isWinner={res?.winner === match.player2} />
        </div>

        {res && (
          <div style={{
            marginTop: 8, padding: '7px 10px', background: '#F1F8F1',
            borderRadius: 6, fontSize: 12, color: G, fontWeight: 600,
          }}>
            ✓ {res.winner} · {res.gameResult || `${res.setsWinner} sets`}
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
            {/* Mostrar sets pronosticados */}
            {[1,2,3,4,5].some(i => pick[`set${i}W`] != null) && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {[1,2,3,4,5].map(i => {
                  const w = pick[`set${i}W`], l = pick[`set${i}L`]
                  if (w == null) return null
                  return (
                    <div key={i} style={{
                      background: '#E8F5E9', borderRadius: 4, padding: '2px 6px',
                      fontSize: 11, fontWeight: 600, color: G,
                    }}>{w}-{l}</div>
                  )
                })}
              </div>
            )}
            {res && (
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: pick.pointsEarned > 0 ? G : '#888' }}>
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

        {!pick && closed && (
          <p style={{ fontSize: 13, color: '#888' }}>Plazo cerrado · No enviaste pronóstico</p>
        )}

        {/* Formulario */}
        {showForm && (
          <div>
            {/* Botones ganador */}
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Ganador</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[match.player1, match.player2].map(p => (
                <button key={p} onClick={() => setWinner(p)} style={{
                  flex: 1, padding: '10px 6px',
                  border: `1px solid ${form.winner === p ? G : BORDER}`,
                  borderRadius: 8,
                  background: form.winner === p ? G : 'white',
                  color: form.winner === p ? 'white' : '#1A1A1A',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {p.split(' ').pop()}
                </button>
              ))}
            </div>

            {/* Grilla de sets */}
            {form.winner && (
              <>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                  Resultado por set (opcional)
                  <span style={{ color: '#C9A84C', fontWeight: 700, marginLeft: 4 }}>+10 pts si acertás todo</span>
                </div>

                {/* Headers de sets */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                  <div />
                  {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                    <div key={s} style={{ fontSize: 9, color: '#888', textAlign: 'center', fontWeight: 600 }}>{s}</div>
                  ))}
                </div>

                {/* Fila ganador */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: G, fontWeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.winner.split(' ').pop()}
                    </span>
                  </div>
                  {form.sets.map((s, i) => (
                    <input key={i} type="number" min="0" max="7" value={s.w}
                      onChange={e => setSetScore(i, 'w', e.target.value)}
                      style={{
                        height: 34, border: `0.5px solid ${s.w !== '' ? G : BORDER}`,
                        borderRadius: 6, textAlign: 'center', fontSize: 14, fontWeight: 700,
                        background: s.w !== '' ? '#E8F5E9' : '#FAFAF7',
                        color: s.w !== '' ? G : '#ccc',
                        width: '100%', padding: 0, outline: 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Fila perdedor */}
                <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(form.winner === match.player1 ? match.player2 : match.player1).split(' ').pop()}
                    </span>
                  </div>
                  {form.sets.map((s, i) => (
                    <input key={i} type="number" min="0" max="7" value={s.l}
                      onChange={e => setSetScore(i, 'l', e.target.value)}
                      style={{
                        height: 34, border: `0.5px solid ${BORDER}`,
                        borderRadius: 6, textAlign: 'center', fontSize: 14, fontWeight: 700,
                        background: '#FAFAF7', color: '#888',
                        width: '100%', padding: 0, outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => submit(editing)} disabled={busy} style={{
                flex: 1, padding: '13px', background: G, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                {busy ? 'Guardando...' : editing ? 'Guardar corrección' : 'Guardar pronóstico'}
              </button>
              {editing && (
                <button onClick={() => setEditing(false)} style={{
                  padding: '13px 16px', background: 'none', color: '#888',
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
