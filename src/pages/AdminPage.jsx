import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const PLAYERS = [
  'Jannik Sinner','Carlos Alcaraz','Novak Djokovic','Alexander Zverev',
  'Daniil Medvedev','Andrey Rublev','Casper Ruud','Holger Rune',
  'Francisco Cerundolo','Taylor Fritz','Tommy Paul','Ben Shelton',
  'Frances Tiafoe','Ugo Humbert','Grigor Dimitrov','Alex de Minaur',
  'Sebastian Korda','Lorenzo Musetti','Nicolas Jarry','Arthur Fils',
]
const G = '#1B5E20'
const COURTS = ['Centre Court','Court 1','Court 2','Court 3']
const ROUNDS = ['R128','R64','R32','R16','QF','SF','F']

function ResultModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [form, setForm] = useState({
    winner: match.result?.winner || '',
    setsWinner: match.result?.setsWinner ?? '',
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
    let cnt = 0
    form.sets.forEach(s => {
      if (s.w !== '' && s.l !== '') {
        const w = parseInt(s.w), l = parseInt(s.l)
        if (!isNaN(w) && !isNaN(l) && w > l) cnt++
      }
    })
    return cnt > 0 ? cnt : null
  }

  const save = async () => {
    if (!form.winner) { show('Elegí el ganador.', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        winner: form.winner,
        setsWinner: form.setsWinner ? parseInt(form.setsWinner) : countSetsWinner(),
        setsLoser: null,
        gameResult: null,
      }
      // Enviar sets individuales
      form.sets.forEach((s, i) => {
        const n = i + 1
        payload[`set${n}W`] = s.w !== '' ? parseInt(s.w) : null
        payload[`set${n}L`] = s.l !== '' ? parseInt(s.l) : null
      })

      console.log('[ResultModal] guardando resultado matchId=' + match.id, payload)

      await api.post(`/admin/matches/${match.id}/result`, payload)
      console.log('[ResultModal] ✓ resultado guardado, status debería ser FINISHED ahora')

      show('Resultado cargado ✓')
      onSaved()
      onClose()
    } catch (e) {
      console.error('[ResultModal] error:', e.response?.data || e.message)
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title">Cargar resultado</div>
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
              {p.split(' ').pop()}
            </button>
          ))}
        </div>

        {/* Sets individuales */}
        {form.winner && (
          <>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
              Resultado por set (opcional pero recomendado)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                <div key={s} style={{ fontSize: 9, color: '#888', textAlign: 'center', fontWeight: 600 }}>{s}</div>
              ))}
            </div>
            {['w','l'].map((side) => (
              <div key={side} style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: side === 'w' ? G : '#888',
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
                      border: `0.5px solid ${s[side] !== '' && side === 'w' ? G : '#E0E0D8'}`,
                      background: s[side] !== '' && side === 'w' ? '#E8F5E9' : '#FAFAF7',
                      color: s[side] !== '' ? (side === 'w' ? G : '#444') : '#ccc',
                    }}
                  />
                ))}
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#888', marginTop: 8, marginBottom: 14 }}>
              Sets del ganador detectado: <strong>{countSetsWinner() ?? '—'}</strong>
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

export default function AdminPage() {
  const { show } = useToast()
  const [matches, setMatches] = useState([])
  const [modal, setModal]     = useState(null)
  const [tResult, setTResult] = useState({ champion: '', semis: ['','','',''] })
  const [newMatch, setNewMatch] = useState({
    matchDate: new Date().toISOString().slice(0,10),
    matchTime: '',
    court: 'Centre Court',
    player1: '',
    player2: '',
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
      console.log('[AdminPage] matches cargados:', m.data.length,
        'con resultado:', m.data.filter(x => x.result).length)
    } catch (e) { console.error(e) }
  }
  useEffect(() => { load() }, [])

  const addMatch = async () => {
    if (!newMatch.player1 || !newMatch.player2) { show('Completá ambos jugadores.', 'error'); return }
    try {
      const payload = {
        matchDate: newMatch.matchDate,
        matchTime: newMatch.matchTime || null,
        court: newMatch.court,
        player1: newMatch.player1,
        player2: newMatch.player2,
        round: newMatch.round,
        followsMatchId: newMatch.followsMatchId || null,
      }
      console.log('[AdminPage] creando partido:', payload)
      await api.post('/admin/matches', payload)
      show('Partido agregado ✓')
      setNewMatch(n => ({ ...n, player1: '', player2: '', followsMatchId: '' }))
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  const deleteMatch = async id => {
    if (!confirm('¿Eliminar este partido? Se re-cadenará la cola de la cancha.')) return
    try { await api.delete(`/admin/matches/${id}`); show('Partido eliminado'); load() }
    catch (e) { show('Error al eliminar.', 'error') }
  }

  const changeStatus = async (matchId, newStatus) => {
    const labels = {
      'IN_PLAY': 'iniciar',
      'SUSPENDED': 'suspender',
      'WALKOVER': 'marcar walkover',
      'RETIRED': 'marcar retiro',
      'ABANDONED': 'abandonar',
    }
    if (!confirm(`¿${labels[newStatus] || 'cambiar status a'} ${newStatus}?`)) return
    try {
      console.log('[AdminPage] changeStatus:', { matchId, newStatus })
      await api.patch(`/admin/matches/${matchId}/status`, { status: newStatus })
      show(`Status cambiado a ${newStatus} ✓`)
      load()
    } catch (e) {
      console.error('[AdminPage] error changeStatus:', e.response?.data || e.message)
      show(e.response?.data?.error || 'Error.', 'error')
    }
  }

  const syncLive = async () => {
    setSyncing('live')
    try {
      console.log('[AdminPage] sync live...')
      const { data } = await api.post('/admin/sync/live')
      console.log('[AdminPage] sync live respuesta:', data)
      show('Live sync ejecutado ✓')
      load()
    } catch (e) {
      console.error('[AdminPage] error sync live:', e.response?.data || e.message)
      show(e.response?.data?.error || 'Error en sync.', 'error')
    }
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
    'SCHEDULED': '#888',
    'IN_PLAY':   '#C62828',
    'SUSPENDED': '#FF9800',
    'FINISHED':  G,
    'WALKOVER':  '#9C27B0',
    'RETIRED':   '#9C27B0',
    'ABANDONED': '#795548',
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Panel de administrador</h2>
      <p className="text-muted mb-16">Gestión de partidos y resultados</p>

      {/* Sync buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, background: syncing === 'live' ? '#ccc' : '#2E7D32' }}
          onClick={syncLive}
          disabled={syncing !== null}
        >
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
            <option value="">— No, es el primero de la cancha —</option>
            {courtMatchesForFollows.map(m => (
              <option key={m.id} value={m.id}>
                #{m.orderInCourt}: {m.player1} vs {m.player2}
              </option>
            ))}
          </select>
          {newMatch.followsMatchId && (
            <p style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
              El horario se calculará automáticamente cuando termine el partido anterior.
            </p>
          )}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Jugador 1</label>
          <select value={newMatch.player1}
            onChange={e => setNewMatch(n => ({ ...n, player1: e.target.value }))}>
            <option value="">— Elegir —</option>
            {PLAYERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Jugador 2</label>
          <select value={newMatch.player2}
            onChange={e => setNewMatch(n => ({ ...n, player2: e.target.value }))}>
            <option value="">— Elegir —</option>
            {PLAYERS.map(p => <option key={p}>{p}</option>)}
          </select>
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
                background: STATUS_COLORS[m.status] || '#888',
                color: '#fff',
              }}>
                {m.status || 'SCHEDULED'}
              </span>
              {m.orderInCourt && (
                <span style={{ fontSize: 10, color: '#888' }}>#{m.orderInCourt} · {m.court}</span>
              )}
              {m.followsMatchId && (
                <span style={{ fontSize: 10, color: '#888' }}>· sigue a #{m.followsMatchId}</span>
              )}
              {m.result && (
                <span style={{ fontSize: 10, color: G, fontWeight: 700 }}>· ✓ resultado cargado</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.player1} vs {m.player2}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {m.matchTime ? `${m.matchTime.slice(0,5)} hs` : 'Sin horario fijo'}
                  {' · '}
                  {m.round}
                  {m.result && <span style={{ color: G, marginLeft: 6, fontWeight: 700 }}>✓ {m.result.winner}</span>}
                </div>
              </div>
              <button onClick={() => setModal(m)} style={{
                background: m.result ? '#E8F5E9' : 'white',
                border: `1px solid ${m.result ? '#C8E6C9' : '#E0E0D8'}`,
                borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', color: m.result ? G : '#444',
              }}>
                {m.result ? '✓ Editar' : 'Resultado'}
              </button>
              <button onClick={() => deleteMatch(m.id)} style={{
                background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 8,
                padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#C62828',
              }}>✕</button>
            </div>

            {/* Acciones rápidas de status */}
            {m.status !== 'FINISHED' && m.status !== 'WALKOVER' && m.status !== 'RETIRED' && m.status !== 'ABANDONED' && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {m.status === 'SCHEDULED' && (
                  <button onClick={() => changeStatus(m.id, 'IN_PLAY')}
                    style={statusBtnStyle('#C62828')}>▶ Iniciar</button>
                )}
                {m.status === 'IN_PLAY' && (
                  <>
                    {/* ✓ Finalizar abre el modal de resultado, NO cambia status directo */}
                    <button onClick={() => setModal(m)}
                      style={statusBtnStyle(G)}>✓ Finalizar</button>
                    <button onClick={() => changeStatus(m.id, 'SUSPENDED')}
                      style={statusBtnStyle('#FF9800')}>⏸ Suspender</button>
                  </>
                )}
                {m.status === 'SUSPENDED' && (
                  <button onClick={() => changeStatus(m.id, 'IN_PLAY')}
                    style={statusBtnStyle('#C62828')}>▶ Reanudar</button>
                )}
                <button onClick={() => changeStatus(m.id, 'WALKOVER')}
                  style={statusBtnStyle('#9C27B0')}>WO</button>
                <button onClick={() => changeStatus(m.id, 'RETIRED')}
                  style={statusBtnStyle('#9C27B0')}>Retiro</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tournament result */}
      <h3 style={{ marginBottom: 10, fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Resultado real del torneo
      </h3>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Campeón real</label>
          <select value={tResult.champion || ''}
            onChange={e => setTResult(r => ({ ...r, champion: e.target.value }))}>
            <option value="">— Sin definir —</option>
            {PLAYERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ marginBottom: 8 }}>
            <label>Semifinalista {i+1}</label>
            <select value={tResult.semis?.[i] || ''} onChange={e => setTSemi(i)(e.target.value)}>
              <option value="">— Sin definir —</option>
              {PLAYERS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        ))}
        <button className="btn btn-primary btn-full mt-12" onClick={saveTResult} disabled={savingT}>
          {savingT ? 'Guardando...' : 'Guardar resultado del torneo'}
        </button>
      </div>

      {modal && (
        <ResultModal match={modal} onClose={() => setModal(null)} onSaved={load} />
      )}
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