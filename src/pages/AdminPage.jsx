import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G = '#1B5E20'
const COURTS = ['Centre Court','Court 1','Court 2','Court 3']
const ROUNDS = ['R128','R64','R32','R16','QF','SF','F']

// Modal para cargar resultado FINAL (con ganador + sets)
function ResultModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [form, setForm] = useState({
    winner: match.result?.winner || '',
    sets: [
      { w: match.result?.set1W ?? '', l: match.result?.set1L ?? '' },
      { w: match.result?.set2W ?? '', l: match.result?.set2L ?? '' },
      { w: match.result?.set3W ?? '', l: match.result?.set3L ?? '' },
      { w: match.result?.set4W ?? '', l: match.result?.set4L ?? '' },
      { w: match.result?.set5W ?? '', l: match.result?.set5L ?? '' },
    ],
  })
  const [saving, setSaving] = useState(false)

  const setSetScore = (idx, side, val) => setForm(f => {
    const sets = f.sets.map((s, i) => i === idx ? { ...s, [side]: val } : s)
    return { ...f, sets }
  })

  const countSetsWinner = () => {
    let w = 0, l = 0
    form.sets.forEach(s => {
      if (s.w !== '' && s.l !== '') {
        const wi = parseInt(s.w), li = parseInt(s.l)
        if (!isNaN(wi) && !isNaN(li)) {
          if (wi > li) w++; else if (li > wi) l++;
        }
      }
    })
    return { setsWinner: w > 0 ? w : null, setsLoser: l > 0 ? l : null }
  }

  const save = async () => {
    if (!form.winner) { show('Elegí el ganador.', 'error'); return }
    setSaving(true)
    try {
      const { setsWinner, setsLoser } = countSetsWinner()
      const payload = {
        winner: form.winner,
        setsWinner,
        setsLoser,
        gameResult: null,
      }
      form.sets.forEach((s, i) => {
        const n = i + 1
        payload[`set${n}W`] = s.w !== '' ? parseInt(s.w) : null
        payload[`set${n}L`] = s.l !== '' ? parseInt(s.l) : null
      })
      await api.post(`/admin/matches/${match.id}/result`, payload)
      show('Resultado cargado ✓')
      onSaved()
      onClose()
    } catch (e) {
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Cargar resultado final</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="text-muted mb-12">
          {match.player1} vs {match.player2}
          <br />
          <span style={{ fontSize: 11 }}>
            {match.court} · {match.round}
            {match.orderInCourt && ` · Partido #${match.orderInCourt}`}
          </span>
        </p>

        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Ganador</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[match.player1, match.player2].map(p => (
            <button key={p} onClick={() => setForm(f => ({ ...f, winner: p }))} style={{
              flex: 1, padding: '10px 6px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${form.winner === p ? G : '#E0E0D8'}`,
              background: form.winner === p ? G : 'white',
              color: form.winner === p ? 'white' : '#1A1A1A',
              fontSize: 13, fontWeight: 600,
            }}>
              {p}
            </button>
          ))}
        </div>

        {form.winner && (
          <>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Resultado por set</div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                <div key={s} style={{ fontSize: 9, color: '#888', textAlign: 'center', fontWeight: 600 }}>{s}</div>
              ))}
            </div>
            {['w','l'].map((side) => (
              <div key={side} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: side === 'w' ? G : '#888',
                  display: 'flex', alignItems: 'center', overflow: 'hidden',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {side === 'w'
                      ? form.winner
                      : (form.winner === match.player1 ? match.player2 : match.player1)}
                  </span>
                </div>
                {form.sets.map((s, i) => (
                  <input key={i} type="number" min="0" max="7" value={s[side]}
                    onChange={e => setSetScore(i, side, e.target.value)}
                    style={{
                      height: 32, borderRadius: 5, textAlign: 'center',
                      fontSize: 13, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
                      border: `0.5px solid ${s[side] !== '' && side === 'w' ? G : '#E0E0D8'}`,
                      background: s[side] !== '' && side === 'w' ? '#E8F5E9' : '#FAFAF7',
                      color: s[side] !== '' ? (side === 'w' ? G : '#444') : '#ccc',
                    }}
                  />
                ))}
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#888', marginTop: 8, marginBottom: 14 }}>
              Sets: <strong>{countSetsWinner().setsWinner ?? 0}-{countSetsWinner().setsLoser ?? 0}</strong>
            </div>
          </>
        )}

        <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar resultado'}
        </button>
      </div>
    </div>
  )
}

// Modal para cargar SCORE EN VIVO (sin winner)
function LiveScoreModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [sets, setSets] = useState([
    { w: match.result?.set1W ?? '', l: match.result?.set1L ?? '' },
    { w: match.result?.set2W ?? '', l: match.result?.set2L ?? '' },
    { w: match.result?.set3W ?? '', l: match.result?.set3L ?? '' },
    { w: match.result?.set4W ?? '', l: match.result?.set4L ?? '' },
    { w: match.result?.set5W ?? '', l: match.result?.set5L ?? '' },
  ])
  const [saving, setSaving] = useState(false)

  const setSetScore = (idx, side, val) => setSets(prev => prev.map((s, i) => i === idx ? { ...s, [side]: val } : s))

  const save = async () => {
    setSaving(true)
    try {
      const payload = { gameResult: null }
      sets.forEach((s, i) => {
        const n = i + 1
        payload[`set${n}W`] = s.w !== '' ? parseInt(s.w) : null
        payload[`set${n}L`] = s.l !== '' ? parseInt(s.l) : null
      })
      await api.patch(`/admin/matches/${match.id}/live-score`, payload)
      show('Score en vivo actualizado ✓')
      onSaved()
      onClose()
    } catch (e) {
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Cargar score en vivo</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="text-muted mb-12">
          {match.player1} vs {match.player2}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
          <div />
          {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
            <div key={s} style={{ fontSize: 9, color: '#888', textAlign: 'center', fontWeight: 600 }}>{s}</div>
          ))}
        </div>
        {['w','l'].map((side) => (
          <div key={side} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: side === 'w' ? G : '#888',
              display: 'flex', alignItems: 'center', overflow: 'hidden',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {side === 'w' ? match.player1 : match.player2}
              </span>
            </div>
            {sets.map((s, i) => (
              <input key={i} type="number" min="0" max="7" value={s[side]}
                onChange={e => setSetScore(i, side, e.target.value)}
                style={{
                  height: 32, borderRadius: 5, textAlign: 'center',
                  fontSize: 13, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
                  border: `0.5px solid ${s[side] !== '' && side === 'w' ? G : '#E0E0D8'}`,
                  background: s[side] !== '' && side === 'w' ? '#E8F5E9' : '#FAFAF7',
                  color: s[side] !== '' ? (side === 'w' ? G : '#444') : '#ccc',
                }}
              />
            ))}
          </div>
        ))}

        <button className="btn btn-primary btn-full" onClick={save} disabled={saving} style={{ marginTop: 14 }}>
          {saving ? 'Guardando...' : 'Actualizar score en vivo'}
        </button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { show } = useToast()
  const [matches, setMatches] = useState([])
  const [modal, setModal]         = useState(null)         // match para ResultModal
  const [liveModal, setLiveModal] = useState(null)         // match para LiveScoreModal
  const [tResult, setTResult] = useState({ champion: '', semis: ['','','',''] })
  const [newMatch, setNewMatch] = useState({
    matchDate: new Date().toISOString().slice(0,10),
    matchTime: '',
    court: 'Centre Court',
    player1: '',   // texto libre
    player2: '',   // texto libre
    round: 'R128',
    followsMatchId: '',
  })
  const [savingT, setSavingT] = useState(false)
  const [syncing, setSyncing] = useState(null)

  const load = async () => {
    try {
      const [m, tr] = await Promise.all([
        api.get('/matches/today'),
        api.get('/tournament/result'),
      ])
      setMatches(m.data)
      setTResult(tr.data)
    } catch (e) { console.error(e) }
  }
  useEffect(() => { load() }, [])

  const addMatch = async () => {
    if (!newMatch.player1.trim() || !newMatch.player2.trim()) {
      show('Completá ambos jugadores.', 'error'); return
    }
    try {
      const payload = {
        matchDate: newMatch.matchDate,
        matchTime: newMatch.matchTime || null,
        court: newMatch.court,
        player1: newMatch.player1.trim(),
        player2: newMatch.player2.trim(),
        round: newMatch.round,
        followsMatchId: newMatch.followsMatchId || null,
      }
      await api.post('/admin/matches', payload)
      show('Partido agregado ✓')
      setNewMatch(n => ({ ...n, player1: '', player2: '', followsMatchId: '' }))
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  const deleteMatch = async id => {
    if (!confirm('¿Eliminar este partido? Se re-cadenará la cola.')) return
    try { await api.delete(`/admin/matches/${id}`); show('Partido eliminado'); load() }
    catch (e) { show('Error.', 'error') }
  }

  const changeStatus = async (matchId, newStatus) => {
    if (!confirm(`¿Cambiar status a ${newStatus}?`)) return
    try {
      await api.patch(`/admin/matches/${matchId}/status`, { status: newStatus })
      show(`Status: ${newStatus} ✓`)
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  // NUEVO — forzar cierre + IN_PLAY en un solo paso
  const forceStart = async matchId => {
    if (!confirm('¿Cerrar pronóstico y pasar a EN JUEGO? Los usuarios no podrán editar más.')) return
    try {
      await api.post(`/admin/matches/${matchId}/force-start`)
      show('Partido cerrado y en juego ✓')
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  const syncLive = async () => {
    setSyncing('live')
    try {
      await api.post('/admin/sync/live')
      show('Live sync ejecutado ✓')
      load()
    } catch (e) { show('Error en sync.', 'error') }
    finally { setSyncing(null) }
  }

  const saveTResult = async () => {
    setSavingT(true)
    try {
      await api.post('/admin/tournament/result', tResult)
      show('Resultado de torneo guardado ✓')
    } catch (e) { show('Error.', 'error') }
    finally { setSavingT(false) }
  }

  const setTSemi = i => v => setTResult(r => {
    const semis = [...(r.semis||['','','',''])]; semis[i] = v; return { ...r, semis }
  })

  const courtMatchesForFollows = matches.filter(m => m.court === newMatch.court)

  const STATUS_COLORS = {
    'SCHEDULED': '#888', 'IN_PLAY': '#C62828', 'SUSPENDED': '#FF9800',
    'FINISHED': G, 'WALKOVER': '#9C27B0', 'RETIRED': '#9C27B0', 'ABANDONED': '#795548',
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Panel de administrador</h2>
      <p className="text-muted mb-16">Gestión de partidos y resultados</p>

      {/* Sync */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-primary" style={{ flex: 1, background: syncing === 'live' ? '#ccc' : '#2E7D32' }}
          onClick={syncLive} disabled={syncing !== null}>
          {syncing === 'live' ? 'Sincronizando...' : '🔴 Sync live'}
        </button>
      </div>

      {/* Add match */}
      <h3 style={{ marginBottom: 10, fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Agregar partido
      </h3>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div>
            <label>Fecha</label>
            <input type="date" value={newMatch.matchDate}
              onChange={e => setNewMatch(n => ({ ...n, matchDate: e.target.value }))} />
          </div>
          <div>
            <label>Hora (opcional)</label>
            <input type="time" value={newMatch.matchTime}
              onChange={e => setNewMatch(n => ({ ...n, matchTime: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Cancha</label>
          <select value={newMatch.court}
            onChange={e => setNewMatch(n => ({ ...n, court: e.target.value, followsMatchId: '' }))}>
            {COURTS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Ronda</label>
          <select value={newMatch.round}
            onChange={e => setNewMatch(n => ({ ...n, round: e.target.value }))}>
            {ROUNDS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>¿Sigue a otro partido en la misma cancha?</label>
          <select value={newMatch.followsMatchId}
            onChange={e => setNewMatch(n => ({ ...n, followsMatchId: e.target.value }))}>
            <option value="">— No, es el primero —</option>
            {courtMatchesForFollows.map(m => (
              <option key={m.id} value={m.id}>#{m.orderInCourt}: {m.player1} vs {m.player2}</option>
            ))}
          </select>
        </div>
        {/* TEXTO LIBRE para jugadores */}
        <div style={{ marginBottom: 8 }}>
          <label>Jugador 1</label>
          <input type="text" placeholder="Escribí el nombre completo" value={newMatch.player1}
            onChange={e => setNewMatch(n => ({ ...n, player1: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Jugador 2</label>
          <input type="text" placeholder="Escribí el nombre completo" value={newMatch.player2}
            onChange={e => setNewMatch(n => ({ ...n, player2: e.target.value }))} />
        </div>
        <button className="btn btn-primary btn-full" onClick={addMatch}>+ Agregar partido</button>
      </div>

      {/* Today's matches */}
      <h3 style={{ marginBottom: 10, fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Partidos de hoy ({matches.length})
      </h3>
      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        {matches.length === 0 && (
          <p style={{ padding: 16, fontSize: 13, color: '#888' }}>No hay partidos para hoy.</p>
        )}
        {matches.map((m, i) => (
          <div key={m.id} style={{
            padding: '11px 14px',
            borderBottom: i < matches.length - 1 ? '1px solid #E0E0D8' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                background: STATUS_COLORS[m.status] || '#888', color: '#fff',
              }}>
                {m.status || 'SCHEDULED'}
              </span>
              {m.orderInCourt && <span style={{ fontSize: 10, color: '#888' }}>#{m.orderInCourt} · {m.court}</span>}
              {m.deadlineForced && <span style={{ fontSize: 10, color: '#C62828' }}>🔒 forzado</span>}
              {m.result && <span style={{ fontSize: 10, color: G, fontWeight: 700 }}>· ✓ score</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.player1} vs {m.player2}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {m.matchTime ? `${m.matchTime.slice(0,5)} hs` : 'Sin horario'} · {m.round}
                </div>
              </div>
              <button onClick={() => setModal(m)} style={{
                background: m.result ? '#E8F5E9' : 'white',
                border: `1px solid ${m.result ? '#C8E6C9' : '#E0E0D8'}`,
                borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', color: m.result ? G : '#444',
              }}>
                {m.result ? '✓' : 'Final'}
              </button>
              <button onClick={() => deleteMatch(m.id)} style={{
                background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8,
                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#C62828',
              }}>✕</button>
            </div>

            {/* Acciones según status */}
            {m.status === 'SCHEDULED' && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <button onClick={() => forceStart(m.id)} style={statusBtnStyle('#C62828')}>
                  🔒 Cerrar y empezar
                </button>
                <button onClick={() => changeStatus(m.id, 'IN_PLAY')} style={statusBtnStyle('#2E7D32')}>
                  ▶ Solo iniciar
                </button>
              </div>
            )}
            {m.status === 'IN_PLAY' && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setLiveModal(m)} style={statusBtnStyle('#1565C0')}>
                  📊 Score en vivo
                </button>
                <button onClick={() => setModal(m)} style={statusBtnStyle(G)}>
                  ✓ Finalizar
                </button>
                <button onClick={() => changeStatus(m.id, 'SUSPENDED')} style={statusBtnStyle('#FF9800')}>
                  ⏸ Suspender
                </button>
              </div>
            )}
            {m.status === 'SUSPENDED' && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <button onClick={() => changeStatus(m.id, 'IN_PLAY')} style={statusBtnStyle('#C62828')}>
                  ▶ Reanudar
                </button>
                <button onClick={() => setModal(m)} style={statusBtnStyle(G)}>✓ Finalizar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tournament result */}
      <h3 style={{ marginBottom: 10, fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Resultado del torneo
      </h3>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Campeón real</label>
          <input type="text" placeholder="Nombre del campeón" value={tResult.champion || ''}
            onChange={e => setTResult(r => ({ ...r, champion: e.target.value }))} />
        </div>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ marginBottom: 8 }}>
            <label>Semifinalista {i+1}</label>
            <input type="text" placeholder="Nombre" value={tResult.semis?.[i] || ''}
              onChange={e => setTSemi(i)(e.target.value)} />
          </div>
        ))}
        <button className="btn btn-primary btn-full mt-12" onClick={saveTResult} disabled={savingT}>
          {savingT ? 'Guardando...' : 'Guardar resultado del torneo'}
        </button>
      </div>

      {modal && <ResultModal match={modal} onClose={() => setModal(null)} onSaved={load} />}
      {liveModal && <LiveScoreModal match={liveModal} onClose={() => setLiveModal(null)} onSaved={load} />}
    </div>
  )
}

function statusBtnStyle(color) {
  return {
    padding: '4px 8px', fontSize: 10, fontWeight: 600,
    background: color, color: '#fff', border: 'none',
    borderRadius: 5, cursor: 'pointer',
  }
}
