import React, { useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G = '#1B5E20'
const GM = '#2E7D32'
const BORDER = '#E0E0D8'

export default function MatchCard({ match, onRefresh }) {
  const { show }       = useToast()
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)

  const pick = match.myPick
  const res  = match.result
  const closed = match.deadlinePassed

  const [form, setForm] = useState({
    winner:      pick?.winner || '',
    setsWinner:  pick?.setsWinner ?? '',
    gamesWinner: pick?.gamesWinner ?? '',
    gamesLoser:  pick?.gamesLoser  ?? '',
  })

  const setF = k => v => setForm(f => ({
    ...f, [k]: v,
    ...(k === 'winner'     ? { setsWinner: '', gamesWinner: '', gamesLoser: '' } : {}),
    ...(k === 'setsWinner' ? { gamesWinner: '', gamesLoser: '' } : {}),
  }))

  const submit = async (useCorrection = false) => {
    if (!form.winner) { show('Elegí un ganador.', 'error'); return }
    setBusy(true)
    try {
      await api.post(`/matches/${match.id}/pick`, {
        winner:      form.winner,
        setsWinner:  form.setsWinner  ? parseInt(form.setsWinner)  : null,
        gamesWinner: form.gamesWinner ? parseInt(form.gamesWinner) : null,
        gamesLoser:  form.gamesLoser  ? parseInt(form.gamesLoser)  : null,
        useCorrection,
      })
      show(useCorrection ? 'Corrección guardada ✓' : 'Pronóstico guardado ✓')
      setEditing(false)
      onRefresh()
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar.', 'error')
    } finally { setBusy(false) }
  }

  const useCorrection = async () => {
    setEditing(true)
    setForm({
      winner:      pick?.winner || '',
      setsWinner:  pick?.setsWinner ?? '',
      gamesWinner: pick?.gamesWinner ?? '',
      gamesLoser:  pick?.gamesLoser  ?? '',
    })
  }

  const showForm = (!pick && !closed) || editing

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
        <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 700 }}>{match.court}</span>
        {match.round && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>{match.round}</span>
        )}
      </div>

      {/* Players */}
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{match.player1}</span>
          {res?.winner === match.player1 && <span style={{ fontSize: 12, color: G, fontWeight: 700 }}>✓ Ganó</span>}
        </div>
        <div style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: '2px 0', fontWeight: 600, letterSpacing: '.05em' }}>
          VS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{match.player2}</span>
          {res?.winner === match.player2 && <span style={{ fontSize: 12, color: G, fontWeight: 700 }}>✓ Ganó</span>}
        </div>
        {res && (
          <div style={{
            marginTop: 8, padding: '7px 10px',
            background: '#F1F8F1', borderRadius: 6, fontSize: 13,
            color: G, fontWeight: 600,
          }}>
            Resultado: {res.winner} {res.setsWinner}-{res.setsWinner === 3 ? 0 : 1} sets
            {res.gamesWinner != null ? ` · ${res.gamesWinner}/${res.gamesLoser} games` : ''}
          </div>
        )}
      </div>

      {/* Pick zone */}
      <div style={{ padding: '12px 14px 14px', borderTop: `1px dashed ${BORDER}`, marginTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GM, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
          Tu pronóstico
        </div>

        {/* Saved pick (not editing) */}
        {pick && !showForm && (
          <>
            <div style={{
              background: '#F1F8F1', border: '1px solid #C8E6C9',
              borderRadius: 8, padding: '10px 12px', fontSize: 13, color: G, fontWeight: 600,
            }}>
              🏆 {pick.winner}
              {pick.setsWinner ? ` · ${pick.setsWinner} sets` : ''}
              {pick.gamesWinner != null ? ` · ${pick.gamesWinner}/${pick.gamesLoser} games` : ''}
              {pick.isCorrection && <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>(corrección)</span>}
            </div>
            {res && (
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700,
                color: pick.pointsEarned > 0 ? G : '#888' }}>
                {pick.pointsEarned > 0 ? `+${pick.pointsEarned} pts ✓` : '0 pts'}
              </div>
            )}
            {!closed && (
              <button onClick={useCorrection} style={{
                width: '100%', marginTop: 8, padding: '8px',
                border: `1px dashed ${GM}`, borderRadius: 8,
                background: 'none', color: GM, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
                ↺ Usar corrección del día
              </button>
            )}
          </>
        )}

        {/* No pick + closed */}
        {!pick && closed && (
          <p style={{ fontSize: 13, color: '#888' }}>Plazo cerrado · No enviaste pronóstico</p>
        )}

        {/* Form */}
        {showForm && (
          <div>
            {/* Winner buttons */}
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Ganador</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[match.player1, match.player2].map(p => (
                <button key={p} onClick={() => setF('winner')(p)} style={{
                  flex: 1, padding: '10px 6px',
                  border: `1px solid ${form.winner === p ? G : BORDER}`,
                  borderRadius: 8,
                  background: form.winner === p ? G : 'white',
                  color: form.winner === p ? 'white' : '#1A1A1A',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all .15s',
                }}>
                  {p.split(' ').pop()}
                </button>
              ))}
            </div>

            {/* Sets */}
            {form.winner && (
              <>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                  Sets del ganador <span style={{ color: '#C9A84C', fontWeight: 700 }}>+3 pts</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {['2','3'].map(v => (
                    <button key={v} onClick={() => setF('setsWinner')(v)} style={{
                      padding: '9px 22px',
                      border: `1px solid ${form.setsWinner === v ? G : BORDER}`,
                      borderRadius: 8,
                      background: form.setsWinner === v ? G : 'white',
                      color: form.setsWinner === v ? 'white' : '#1A1A1A',
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    }}>{v}</button>
                  ))}
                </div>
              </>
            )}

            {/* Games */}
            {form.setsWinner && (
              <>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                  Games totales (opcional) <span style={{ color: '#C9A84C', fontWeight: 700 }}>+10 pts</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, textTransform: 'none', letterSpacing: 0, color: '#888' }}>
                      Ganador
                    </label>
                    <input type="number" min="0" max="99" placeholder="Ej: 12"
                      value={form.gamesWinner}
                      onChange={e => setF('gamesWinner')(e.target.value)}
                      style={{ textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, textTransform: 'none', letterSpacing: 0, color: '#888' }}>
                      Perdedor
                    </label>
                    <input type="number" min="0" max="99" placeholder="Ej: 8"
                      value={form.gamesLoser}
                      onChange={e => setF('gamesLoser')(e.target.value)}
                      style={{ textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => submit(editing)} disabled={busy}>
                {busy ? 'Guardando...' : editing ? 'Guardar corrección' : 'Guardar pronóstico'}
              </button>
              {editing && (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
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
