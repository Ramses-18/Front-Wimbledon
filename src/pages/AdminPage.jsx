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

function ResultModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [form, setForm] = useState({
    winner: match.result?.winner || '',
    setsWinner: match.result?.setsWinner ?? '',
    gamesWinner: match.result?.gamesWinner ?? '',
    gamesLoser:  match.result?.gamesLoser  ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.winner) { show('Elegí el ganador.', 'error'); return }
    setSaving(true)
    try {
      await api.post(`/admin/matches/${match.id}/result`, {
        winner: form.winner,
        setsWinner:  form.setsWinner  ? parseInt(form.setsWinner)  : null,
        gamesWinner: form.gamesWinner ? parseInt(form.gamesWinner) : null,
        gamesLoser:  form.gamesLoser  ? parseInt(form.gamesLoser)  : null,
      })
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
          <div className="modal-title">Cargar resultado</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p className="text-muted mb-12">{match.player1} vs {match.player2}</p>

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

        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Sets del ganador</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['2','3'].map(v => (
            <button key={v} onClick={() => setForm(f => ({ ...f, setsWinner: v }))} style={{
              padding: '9px 22px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${form.setsWinner === v ? G : '#E0E0D8'}`,
              background: form.setsWinner === v ? G : 'white',
              color: form.setsWinner === v ? 'white' : '#1A1A1A',
              fontSize: 15, fontWeight: 700,
            }}>{v}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Games totales (opcional)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', textTransform: 'none', letterSpacing: 0, marginBottom: 4 }}>Games ganador</label>
            <input type="number" min="0" max="99" value={form.gamesWinner}
              onChange={e => setForm(f => ({ ...f, gamesWinner: e.target.value }))}
              style={{ textAlign: 'center', fontWeight: 700 }} placeholder="Ej: 12" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', textTransform: 'none', letterSpacing: 0, marginBottom: 4 }}>Games perdedor</label>
            <input type="number" min="0" max="99" value={form.gamesLoser}
              onChange={e => setForm(f => ({ ...f, gamesLoser: e.target.value }))}
              style={{ textAlign: 'center', fontWeight: 700 }} placeholder="Ej: 8" />
          </div>
        </div>

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
    matchTime: '12:00',
    court: 'Centre Court', player1: '', player2: '', round: 'R128',
  })
  const [savingT, setSavingT] = useState(false)

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
    if (!newMatch.player1 || !newMatch.player2) { show('Completá ambos jugadores.', 'error'); return }
    try {
      await api.post('/admin/matches', newMatch)
      show('Partido agregado ✓')
      setNewMatch(n => ({ ...n, player1: '', player2: '' }))
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  const deleteMatch = async id => {
    if (!confirm('¿Eliminar este partido?')) return
    try { await api.delete(`/admin/matches/${id}`); show('Partido eliminado'); load() }
    catch (e) { show('Error al eliminar.', 'error') }
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

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Panel de administrador</h2>
      <p className="text-muted mb-16">Gestión de partidos y resultados</p>

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
            <label>Hora</label>
            <input type="time" value={newMatch.matchTime}
              onChange={e => setNewMatch(n => ({ ...n, matchTime: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Cancha</label>
          <select value={newMatch.court}
            onChange={e => setNewMatch(n => ({ ...n, court: e.target.value }))}>
            {['Centre Court','Court 1','Court 2','Court 3'].map(c =>
              <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Ronda</label>
          <select value={newMatch.round}
            onChange={e => setNewMatch(n => ({ ...n, round: e.target.value }))}>
            {['R128','R64','R32','R16','QF','SF','F'].map(r => <option key={r}>{r}</option>)}
          </select>
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
            display: 'flex', alignItems: 'center', padding: '11px 14px',
            borderBottom: i < matches.length - 1 ? '1px solid #E0E0D8' : 'none',
            gap: 8,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.player1} vs {m.player2}</div>
              <div style={{ fontSize: 11, color: '#888' }}>
                {m.matchTime?.slice(0,5)} · {m.court}
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
