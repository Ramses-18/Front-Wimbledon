import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const C = {
  bg:         '#0a1a0f',
  green:      '#4CAF50',
  greenDeep:  '#1B5E20',
  greenPale:  'rgba(76,175,80,.08)',
  white:      '#fff',
  white50:    'rgba(255,255,255,.50)',
  white35:    'rgba(255,255,255,.35)',
  white25:    'rgba(255,255,255,.25)',
  white18:    'rgba(255,255,255,.18)',
  white12:    'rgba(255,255,255,.12)',
  white06:    'rgba(255,255,255,.06)',
  gold:       '#C8A951',
  red:        '#f44336',
  orange:     '#FF9800',
  blue:       '#64B5F6',
}
const G = C.green
const COURTS = ['Centre Court','Court 1','Court 2','Court 3','Court 4','Court 5','Court 6','Court 7','Court 8','Court 9','Court 10','Court 11','Court 12','Court 13','Court 14','Court 15','Court 16','Court 17','Court 18','Court 19','Court 20']
const ROUNDS = ['R128','R64','R32','R16','QF','SF','F']

// Modal para cargar resultado FINAL (con ganador + sets)
function ResultModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [form, setForm] = useState({
    winner: match.result?.winner || '',
    retired: false,
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
        setsWinner: form.retired ? null : setsWinner,
        setsLoser: form.retired ? null : setsLoser,
        gameResult: form.retired ? 'RET' : null,
        retired: form.retired || null,
      }
      if (!form.retired) {
        form.sets.forEach((s, i) => {
          const n = i + 1
          payload[`set${n}W`] = s.w !== '' ? parseInt(s.w) : null
          payload[`set${n}L`] = s.l !== '' ? parseInt(s.l) : null
        })
      }
      await api.post(`/admin/matches/${match.id}/result`, payload)
      show(form.retired ? 'Resultado cargado (retiro) ✓' : 'Resultado cargado ✓')
      onSaved()
      onClose()
    } catch (e) {
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', width: '100%', maxWidth: 430, maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.white18, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white50 }}>Cargar resultado final</div>
          <button onClick={onClose} style={{ background: C.white06, border: 'none', color: C.white35, width: 28, height: 28, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: C.white25, marginBottom: 12 }}>
          {match.player1} vs {match.player2}
          <br />
          <span style={{ fontSize: 11, color: C.white18 }}>
            {match.court} · {match.round}
            {match.orderInCourt && ` · Partido #${match.orderInCourt}`}
          </span>
        </p>

        <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Ganador</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[match.player1, match.player2].map(p => (
            <button key={p} onClick={() => setForm(f => ({ ...f, winner: p }))} style={{
              flex: 1, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${form.winner === p ? C.green : C.white12}`,
              background: form.winner === p ? C.green : 'transparent',
              color: form.winner === p ? '#fff' : C.white35,
              fontSize: 13, fontWeight: 600,
            }}>
              {p}
            </button>
          ))}
        </div>

        {form.winner && !form.retired && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Resultado por set</div>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                <div key={s} style={{ fontSize: 9, color: C.white18, textAlign: 'center', fontWeight: 600 }}>{s}</div>
              ))}
            </div>
            {['w','l'].map((side) => (
              <div key={side} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: side === 'w' ? C.green : C.white35,
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
                      border: `1px solid ${s[side] !== '' && side === 'w' ? 'rgba(76,175,80,.2)' : 'rgba(255,255,255,.08)'}`,
                      background: s[side] !== '' && side === 'w' ? 'rgba(76,175,80,.12)' : 'rgba(255,255,255,.04)',
                      color: s[side] !== '' ? (side === 'w' ? C.green : C.white35) : C.white18,
                    }}
                  />
                ))}
              </div>
            ))}
            <div style={{ fontSize: 11, color: C.white18, marginTop: 8, marginBottom: 14 }}>
              Sets: <strong style={{ color: C.white50 }}>{countSetsWinner().setsWinner ?? 0}-{countSetsWinner().setsLoser ?? 0}</strong>
            </div>
          </>
        )}

        {/* Opcion de retiro */}
        {form.winner && (
          <div style={{
            marginBottom: 14, padding: '10px 12px', borderRadius: 10,
            border: `1px solid ${form.retired ? 'rgba(156,39,176,.3)' : C.white12}`,
            background: form.retired ? 'rgba(156,39,176,.05)' : 'transparent',
          }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13,
            }}>
              <input
                type="checkbox"
                checked={form.retired}
                onChange={e => setForm(f => ({ ...f, retired: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#9C27B0' }}
              />
              <div>
                <div style={{ fontWeight: 600, color: form.retired ? '#9C27B0' : C.white50 }}>
                  Un jugador se retiró
                </div>
                <div style={{ fontSize: 11, color: C.white18, marginTop: 2 }}>
                  Se guarda como retiro sin necesidad de cargar sets.
                </div>
              </div>
            </label>
          </div>
        )}

        <button onClick={save} disabled={saving} style={{ background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, width: '100%', border: 'none', cursor: 'pointer' }}>
          {saving ? 'Guardando...' : form.retired ? 'Guardar como retiro' : 'Guardar resultado'}
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
      console.log('[LiveScore] payload:', JSON.stringify(payload))
      console.log('[LiveScore] patch url: /admin/matches/' + match.id + '/live-score')
      const resp = await api.patch(`/admin/matches/${match.id}/live-score`, payload)
      console.log('[LiveScore] response:', resp.status, resp.data)
      show('Score en vivo actualizado ✓')
      onSaved()
      onClose()
    } catch (e) {
      console.error('[LiveScore] ERROR:', e.response?.status, e.response?.data, e.message)
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', width: '100%', maxWidth: 430, maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.white18, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white50 }}>Cargar score en vivo</div>
          <button onClick={onClose} style={{ background: C.white06, border: 'none', color: C.white35, width: 28, height: 28, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: C.white25, marginBottom: 12 }}>
          {match.player1} vs {match.player2}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
          <div />
          {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
            <div key={s} style={{ fontSize: 9, color: C.white18, textAlign: 'center', fontWeight: 600 }}>{s}</div>
          ))}
        </div>
        {['w','l'].map((side) => (
          <div key={side} style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: side === 'w' ? C.green : C.white35,
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
                  border: `1px solid ${s[side] !== '' && side === 'w' ? 'rgba(76,175,80,.2)' : 'rgba(255,255,255,.08)'}`,
                  background: s[side] !== '' && side === 'w' ? 'rgba(76,175,80,.12)' : 'rgba(255,255,255,.04)',
                  color: s[side] !== '' ? (side === 'w' ? C.green : C.white35) : C.white18,
                }}
              />
            ))}
          </div>
        ))}

        <button onClick={save} disabled={saving} style={{ marginTop: 14, background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, width: '100%', border: 'none', cursor: 'pointer' }}>
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
    matchDate: new Date().toLocaleDateString('en-CA'),
    matchTime: '',
    court: 'Centre Court',
    player1: '',
    player2: '',
    round: 'R128',
    followsMatchId: '',
  })
  const [savingT, setSavingT] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  // Bracket management
  const [bracket, setBracket] = useState(null)
  const [bracketLoading, setBracketLoading] = useState(true)
  const [bracketError, setBracketError] = useState('')
  const [bracketRound, setBracketRound] = useState('R128')
  const [bracketModal, setBracketModal] = useState(null)

  const load = async () => {
    try {
      const [m, tr] = await Promise.all([
        api.get('/matches/upcoming'),
        api.get('/tournament/result'),
      ])
      setMatches(m.data)
      setTResult(tr.data)
    } catch (e) {
      show(`Error cargando partidos: ${e.response?.data?.error || e.message}`, 'error')
    }
  }
  useEffect(() => { load() }, [])
  useEffect(() => { loadBracket() }, [])

  const loadBracket = async () => {
    setBracketLoading(true)
    try {
      const { data } = await api.get('/bracket')
      setBracket(data)
      setBracketError('')
    } catch (e) {
      setBracketError('Error al cargar el cuadro.')
    } finally {
      setBracketLoading(false)
    }
  }

  const initBracket = async () => {
    if (!confirm('¿Inicializar el cuadro? Esto crea 15 partidos vacíos (R16 → F). Solo se hace una vez.')) return
    try {
      await api.post('/bracket/init')
      show('Cuadro inicializado ✓')
      loadBracket()
    } catch (e) {
      show(e.response?.data?.error || 'Error al inicializar', 'error')
    }
  }

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

  // FIX Req 3: Solo cerrar pronóstico (sin cambiar status del partido)
  const forceDeadline = async matchId => {
    if (!confirm('¿Cerrar pronóstico? Los usuarios no podrán editar ni usar correcciones.')) return
    try {
      await api.post(`/admin/matches/${matchId}/force-deadline`)
      show('Pronóstico cerrado ✓')
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
  }

  // Cerrar + iniciar en un paso
  const forceStart = async matchId => {
    if (!confirm('¿Cerrar pronóstico y pasar a EN JUEGO?')) return
    try {
      await api.post(`/admin/matches/${matchId}/force-start`)
      show('Partido cerrado y en juego ✓')
      load()
    } catch (e) { show(e.response?.data?.error || 'Error.', 'error') }
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

  // FIX Req 2: Detectar si el bracket está vacío
  const bracketEmpty = bracket && bracket.matches && bracket.matches.length === 0
  const roundMatches = (bracket?.matches || []).filter(m => m.round === bracketRound)

  const STATUS_PILL = {
    'IN_PLAY':    { bg: 'rgba(244,67,54,.12)', color: 'rgba(244,67,54,.8)' },
    'FINISHED':   { bg: 'rgba(76,175,80,.1)', color: 'rgba(76,175,80,.7)' },
    'SCHEDULED':  { bg: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.25)' },
    'SUSPENDED':  { bg: 'rgba(255,152,0,.1)', color: 'rgba(255,152,0,.7)' },
    'WALKOVER':   { bg: 'rgba(156,39,176,.1)', color: 'rgba(156,39,176,.7)' },
    'RETIRED':    { bg: 'rgba(156,39,176,.1)', color: 'rgba(156,39,176,.7)' },
    'ABANDONED':  { bg: 'rgba(121,85,72,.1)', color: 'rgba(121,85,72,.7)' },
  }

  const actionBtn = (variant) => ({
    padding: '10px 4px', fontSize: 10, fontWeight: 600,
    border: '1px solid rgba(255,255,255,.05)', borderRadius: 10,
    cursor: 'pointer', background: 'rgba(255,255,255,.02)',
    color: 'rgba(255,255,255,.35)', transition: 'all .15s',
    ...(variant === 'primary' ? {
      background: 'rgba(76,175,80,.08)', borderColor: 'rgba(76,175,80,.15)', color: 'rgba(76,175,80,.7)',
    } : {}),
    ...(variant === 'blue' ? {
      background: 'rgba(100,181,246,.05)', borderColor: 'rgba(100,181,246,.1)', color: 'rgba(100,181,246,.6)',
    } : {}),
    ...(variant === 'danger' ? {
      background: 'rgba(244,67,54,.05)', borderColor: 'rgba(244,67,54,.1)', color: 'rgba(244,67,54,.5)',
    } : {}),
    ...(variant === 'orange' ? {
      background: 'rgba(255,152,0,.08)', borderColor: 'rgba(255,152,0,.12)', color: 'rgba(255,152,0,.7)',
    } : {}),
  })

  const Dot = () => <span style={{ width: 2, height: 2, borderRadius: '50%', background: C.white06, display: 'inline-block', margin: '0 4px' }} />

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: C.greenDeep, zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '24px 16px 100px' }}>

      <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, color: C.white50, letterSpacing: '.04em' }}>
        Panel de administrador
        <div style={{ fontSize: 10, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>
          Gestión de partidos y resultados
        </div>
      </div>

      {/* Agregar partido */}
      <div style={{ marginBottom: 20, marginTop: 20 }}>
        <button
          onClick={() => setShowAddForm(f => !f)}
          style={{
            width: '100%', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600,
            background: showAddForm ? 'transparent' : 'rgba(255,255,255,.04)',
            border: showAddForm ? '1px solid rgba(244,67,54,.2)' : '1px solid rgba(255,255,255,.08)',
            color: showAddForm ? 'rgba(244,67,54,.7)' : C.white50,
            cursor: 'pointer',
          }}>
          {showAddForm ? '✕ Cerrar' : '+ Agregar partido'}
        </button>
      </div>

      {/* Add match form — oculto hasta que apriete el botón */}
      {showAddForm && (
      <div style={{ marginBottom: 20, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Fecha</label>
            <input type="date" value={newMatch.matchDate}
              onChange={e => setNewMatch(n => ({ ...n, matchDate: e.target.value }))}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Hora (opcional)</label>
            <input type="time" value={newMatch.matchTime}
              onChange={e => setNewMatch(n => ({ ...n, matchTime: e.target.value }))}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Cancha</label>
          <select value={newMatch.court}
            onChange={e => setNewMatch(n => ({ ...n, court: e.target.value, followsMatchId: '' }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }}>
            {COURTS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Ronda</label>
          <select value={newMatch.round}
            onChange={e => setNewMatch(n => ({ ...n, round: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }}>
            {ROUNDS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>¿Sigue a otro partido en la misma cancha?</label>
          <select value={newMatch.followsMatchId}
            onChange={e => setNewMatch(n => ({ ...n, followsMatchId: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }}>
            <option value="">— No, es el primero —</option>
            {courtMatchesForFollows.map(m => (
              <option key={m.id} value={m.id}>#{m.orderInCourt}: {m.player1} vs {m.player2}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Jugador 1</label>
          <input type="text" placeholder="Escribí el nombre completo" value={newMatch.player1}
            onChange={e => setNewMatch(n => ({ ...n, player1: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Jugador 2</label>
          <input type="text" placeholder="Escribí el nombre completo" value={newMatch.player2}
            onChange={e => setNewMatch(n => ({ ...n, player2: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
        </div>
        <button onClick={addMatch} style={{ width: '100%', background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Agregar partido</button>
      </div>
      )}

      {/* Partidos de hoy y mañana */}
      {(() => {
        const todayStr = new Date().toLocaleDateString('en-CA')
        const tmr = new Date(); tmr.setDate(tmr.getDate() + 1)
        const tomorrowStr = tmr.toLocaleDateString('en-CA')
        const todayM = matches.filter(m => m.matchDate === todayStr)
        const tomorrowM = matches.filter(m => m.matchDate === tomorrowStr)
        const upcomingM = matches.filter(m => m.matchDate > tomorrowStr)
        const activePastM = matches.filter(m => m.matchDate < todayStr && (m.status === 'IN_PLAY' || m.status === 'SUSPENDED'))
        const todayHasLive = todayM.some(m => m.status === 'IN_PLAY' || m.status === 'SUSPENDED')

        const renderMatchList = (list) => list.length === 0
          ? <p style={{ padding: 24, fontSize: 12, color: C.white18, textAlign: 'center' }}>No hay partidos.</p>
          : list.map((m, i) => {
            const isLive = m.status === 'IN_PLAY' || m.status === 'SUSPENDED'
            const pill = STATUS_PILL[m.status] || STATUS_PILL.SCHEDULED
            const hasResult = m.status === 'FINISHED' && m.result
            return (
          <div key={m.id} style={{
            background: isLive ? 'rgba(244,67,54,.02)' : 'rgba(255,255,255,.03)',
            border: `1px solid ${isLive ? 'rgba(244,67,54,.12)' : 'rgba(255,255,255,.05)'}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 8,
          }}>
            {/* Top row: players + status pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.7)', letterSpacing: '-.01em' }}>
                {m.player1} vs {m.player2}
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 8, fontWeight: 700,
                letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                background: pill.bg, color: pill.color,
              }}>
                {m.status === 'IN_PLAY' ? 'EN JUEGO' : m.status === 'FINISHED' ? 'FINALIZADO' : m.status === 'SUSPENDED' ? 'SUSPENDIDO' : m.status === 'WALKOVER' ? 'WO' : m.status === 'RETIRED' ? 'RETIRO' : m.status || 'PROGRAMADO'}
              </span>
            </div>

            {/* Info row */}
            <div style={{ marginBottom: 14, fontSize: 10, color: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
              {m.orderInCourt && <span>#{m.orderInCourt}</span>}
              {m.orderInCourt && m.court && <Dot />}
              {m.court && <span>{m.court}</span>}
              {m.court && m.matchTime && <Dot />}
              {m.matchTime && <span>{m.matchTime.slice(0,5)} hs</span>}
              {(m.court || m.matchTime) && <Dot />}
              <span>{m.round}</span>
              {m.deadlineForced && (
                <>
                  <Dot />
                  <span style={{ color: C.red, fontWeight: 600 }}>cerrado</span>
                </>
              )}
              {m.result && (
                <>
                  <Dot />
                  <span style={{ color: C.green, fontWeight: 600 }}>score</span>
                </>
              )}
            </div>

            {/* Action Grid */}
            {hasResult ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button onClick={() => setModal(m)} style={actionBtn('primary')}>Ver score</button>
                <button onClick={() => deleteMatch(m.id)} style={actionBtn('danger')}>Eliminar</button>
                <div style={{ visibility: 'hidden' }} />
              </div>
            ) : m.status === 'SCHEDULED' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {!m.deadlineForced && (
                  <button onClick={() => forceDeadline(m.id)} style={actionBtn('orange')}>Cerrar pronóstico</button>
                )}
                {m.deadlineForced && (
                  <button onClick={() => changeStatus(m.id, 'IN_PLAY')} style={actionBtn('primary')}>Iniciar</button>
                )}
                <button onClick={() => forceStart(m.id)} style={actionBtn('primary')} disabled={m.deadlineForced}>
                  Cerrar+Empezar
                </button>
                <button onClick={() => deleteMatch(m.id)} style={actionBtn('danger')}>Eliminar</button>
              </div>
            ) : m.status === 'IN_PLAY' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button onClick={() => setModal(m)} style={actionBtn('primary')}>Finalizar</button>
                <button onClick={() => setLiveModal(m)} style={actionBtn('blue')}>Score en vivo</button>
                <button onClick={() => changeStatus(m.id, 'SUSPENDED')} style={actionBtn('orange')}>Suspender</button>
              </div>
            ) : m.status === 'SUSPENDED' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button onClick={() => changeStatus(m.id, 'IN_PLAY')} style={actionBtn('primary')}>Reanudar</button>
                <button onClick={() => setModal(m)} style={actionBtn('primary')}>Finalizar</button>
                <div style={{ visibility: 'hidden' }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <div style={{ visibility: 'hidden' }} />
                <div style={{ visibility: 'hidden' }} />
                <button onClick={() => deleteMatch(m.id)} style={actionBtn('danger')}>Eliminar</button>
              </div>
            )}
          </div>
        )})

        return (
          <>
            {activePastM.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 2, height: 10, borderRadius: 1, background: 'rgba(255,152,0,.6)', display: 'inline-block' }} />
                  Reanudados <span style={{ color: C.white12, fontWeight: 400, letterSpacing: '.05em' }}>{activePastM.length}</span>
                </div>
                {renderMatchList(activePastM)}
              </>
            )}

            <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 2, height: 10, borderRadius: 1, background: todayHasLive ? 'rgba(244,67,54,.6)' : 'rgba(255,255,255,.3)', display: 'inline-block' }} />
              Hoy <span style={{ color: C.white12, fontWeight: 400, letterSpacing: '.05em' }}>{todayM.length}</span>
            </div>
            {renderMatchList(todayM)}

            <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 2, height: 10, borderRadius: 1, background: 'rgba(255,255,255,.3)', display: 'inline-block' }} />
              Mañana <span style={{ color: C.white12, fontWeight: 400, letterSpacing: '.05em' }}>{tomorrowM.length}</span>
            </div>
            {renderMatchList(tomorrowM)}

            {upcomingM.length > 0 && (() => {
              const grouped = {}
              upcomingM.forEach(m => {
                if (!grouped[m.matchDate]) grouped[m.matchDate] = []
                grouped[m.matchDate].push(m)
              })

              const dateStr = (d) => {
                const [y, mo, da] = d.split('-')
                return new Date(y, mo - 1, da).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
              }
              return (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 2, height: 10, borderRadius: 1, background: 'rgba(255,255,255,.3)', display: 'inline-block' }} />
                    Próximos días <span style={{ color: C.white12, fontWeight: 400, letterSpacing: '.05em' }}>{upcomingM.length}</span>
                  </div>
                  {Object.entries(grouped).sort().map(([date, list]) => (
                    <div key={date} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.white50, marginBottom: 6, paddingLeft: 4, textTransform: 'capitalize' }}>
                        {dateStr(date)}
                        <span style={{ color: C.white18, fontWeight: 500, marginLeft: 6 }}>· {list.length} partido{list.length > 1 ? 's' : ''}</span>
                      </div>
                      {renderMatchList(list)}
                    </div>
                  ))}
                </>
              )
            })()}
          </>
        )
      })()}

      {/* Cuadro del torneo */}
      <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 2, height: 10, borderRadius: 1, background: C.white35, display: 'inline-block' }} />
        Cuadro del torneo
      </div>
      <div style={{ marginBottom: 24 }}>
        {bracketLoading ? (
          <div className="spinner" />
        ) : bracketError ? (
          <>
            <p style={{ fontSize: 11, color: C.white18, marginBottom: 10 }}>{bracketError}</p>
            <button onClick={initBracket} style={{ width: '100%', background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Inicializar cuadro
            </button>
          </>
        ) : bracketEmpty ? (
          <>
            <p style={{ fontSize: 11, color: C.white18, marginBottom: 10 }}>
              El cuadro aún no tiene partidos. Inicializalo para crear la estructura (R16 → Final).
            </p>
            <button onClick={initBracket} style={{ width: '100%', background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Inicializar cuadro (15 partidos)
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, color: C.white18, marginBottom: 10 }}>
              Elegí una ronda para editar los partidos. Cuando seteás un ganador, se propaga automáticamente al partido siguiente.
            </p>
            {/* Selector de ronda */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {(bracket?.rounds || []).map(r => {
                const count = (bracket?.matches || []).filter(m => m.round === r.key && (m.player1 || m.player2)).length
                const on = bracketRound === r.key
                return (
                  <button key={r.key} onClick={() => setBracketRound(r.key)} style={{
                    padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6,
                    border: `1px solid ${on ? C.green : C.white12}`,
                    background: on ? C.green : 'transparent',
                    color: on ? '#fff' : C.white35,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                    {r.label || r.key} <span style={{ background: on ? 'rgba(255,255,255,.2)' : C.white06, fontSize: 8, borderRadius: 3, padding: '1px 4px', marginLeft: 2 }}>{count}/{r.count}</span>
                  </button>
                )
              })}
            </div>
            {/* Lista de partidos de la ronda seleccionada */}
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {roundMatches.length === 0 ? (
                <p style={{ fontSize: 12, color: C.white18, textAlign: 'center', padding: 24 }}>
                  No hay partidos en esta ronda.
                </p>
              ) : (
                roundMatches.map(m => (
                  <div key={m.id} style={{
                    padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                    border: `1px solid ${m.winner ? 'rgba(76,175,80,.15)' : 'rgba(255,255,255,.05)'}`,
                    background: m.winner ? 'rgba(76,175,80,.03)' : 'rgba(255,255,255,.02)',
                    cursor: 'pointer',
                  }} onClick={() => setBracketModal(m)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: m.winner === m.player1 ? C.green : 'rgba(255,255,255,.5)' }}>
                          {m.winner === m.player1 ? '✓ ' : ''}{m.player1 || '—'}
                          {m.scoreStr && m.winner === m.player1 && <span style={{ fontSize: 10, color: C.white18, marginLeft: 4 }}>{m.scoreStr}</span>}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: m.winner === m.player2 ? C.green : 'rgba(255,255,255,.5)' }}>
                          {m.winner === m.player2 ? '✓ ' : ''}{m.player2 || '—'}
                          {m.scoreStr && m.winner === m.player2 && <span style={{ fontSize: 10, color: C.white18, marginLeft: 4 }}>{m.scoreStr}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ fontSize: 10, color: C.white18 }}>#{m.positionInRound}</span>
                        {m.status === 'FINISHED' && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: C.green, padding: '1px 6px', borderRadius: 4, background: 'rgba(76,175,80,.1)' }}>
                            {m.setsWinner}-{m.setsLoser}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Tournament result */}
      <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.1em', textTransform: 'uppercase', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 2, height: 10, borderRadius: 1, background: C.white35, display: 'inline-block' }} />
        Resultado del torneo
      </div>
      <div style={{ marginBottom: 24, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Campeón real</label>
          <input type="text" placeholder="Nombre del campeón" value={tResult.champion || ''}
            onChange={e => setTResult(r => ({ ...r, champion: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
        </div>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Semifinalista {i+1}</label>
            <input type="text" placeholder="Nombre" value={tResult.semis?.[i] || ''}
              onChange={e => setTSemi(i)(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px' }} />
          </div>
        ))}
        <button onClick={saveTResult} disabled={savingT} style={{ marginTop: 12, width: '100%', background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          {savingT ? 'Guardando...' : 'Guardar resultado del torneo'}
        </button>
      </div>

      {modal && <ResultModal match={modal} onClose={() => setModal(null)} onSaved={load} />}
      {liveModal && <LiveScoreModal match={liveModal} onClose={() => setLiveModal(null)} onSaved={load} />}
      {bracketModal && (
        <BracketEditorModal
          match={bracketModal}
          onClose={() => setBracketModal(null)}
          onSaved={() => { setBracketModal(null); loadBracket() }}
        />
      )}

      </div>
    </div>
  )
}

function statusBtnStyle(color) {
  return {
    padding: '6px 10px', fontSize: 11, fontWeight: 600,
    background: color, color: '#fff', border: 'none',
    borderRadius: 6, cursor: 'pointer',
  }
}

// FIX Req 2: Modal para editar un partido del bracket con sets individuales
function BracketEditorModal({ match, onClose, onSaved }) {
  const { show } = useToast()
  const [form, setForm] = useState({
    player1: match.player1 || '',
    player2: match.player2 || '',
    sets: [
      { w: '', l: '' },
      { w: '', l: '' },
      { w: '', l: '' },
      { w: '', l: '' },
      { w: '', l: '' },
    ],
  })

  // Parsear scoreStr si existe para pre-cargar los sets
  React.useEffect(() => {
    if (match.scoreStr) {
      const parts = match.scoreStr.split(',').map(s => s.trim())
      const newSets = [{ w: '', l: '' }, { w: '', l: '' }, { w: '', l: '' }, { w: '', l: '' }, { w: '', l: '' }]
      parts.forEach((part, i) => {
        if (i < 5) {
          const nums = part.split('-')
          if (nums.length === 2) {
            newSets[i] = { w: nums[0].trim(), l: nums[1].trim() }
          }
        }
      })
      setForm(f => ({ ...f, sets: newSets }))
    }
  }, [match.scoreStr])

  const [saving, setSaving] = useState(false)

  const setSetScore = (idx, side, val) => setForm(f => {
    const sets = f.sets.map((s, i) => i === idx ? { ...s, [side]: val } : s)
    return { ...f, sets }
  })

  const countSets = () => {
    let w = 0, l = 0
    form.sets.forEach(s => {
      if (s.w !== '' && s.l !== '') {
        const wi = parseInt(s.w), li = parseInt(s.l)
        if (!isNaN(wi) && !isNaN(li)) {
          if (wi > li) w++; else if (li > wi) l++;
        }
      }
    })
    return { setsWinner: w, setsLoser: l }
  }

  const buildScoreStr = () => {
    return form.sets
      .filter(s => s.w !== '' && s.l !== '')
      .map(s => `${s.w}-${s.l}`)
      .join(', ')
  }

  const filledSets = form.sets.filter(s => s.w !== '' && s.l !== '').length
  const { setsWinner, setsLoser } = countSets()
  // Auto-determinar ganador por sets
  const autoWinner = setsWinner > setsLoser ? form.player1
    : setsLoser > setsWinner ? form.player2
    : ''

  const save = async () => {
    if (filledSets === 0) {
      show('Cargá al menos un set para guardar el resultado.', 'error')
      return
    }
    if (setsWinner === setsLoser) {
      show('El resultado debe tener un ganador claro en sets.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put(`/bracket/${match.id}`, {
        player1: form.player1 || null,
        player2: form.player2 || null,
        winner: autoWinner || null,
        scoreStr: autoWinner ? buildScoreStr() : null,
        setsWinner: autoWinner ? setsWinner : null,
        setsLoser: autoWinner ? setsLoser : null,
        status: autoWinner ? 'FINISHED' : 'SCHEDULED',
      })
      show('Partido del cuadro actualizado ✓')
      onSaved()
    } catch (e) {
      show(e.response?.data?.error || 'Error.', 'error')
    } finally { setSaving(false) }
  }

  const clearResult = async () => {
    setSaving(true)
    try {
      await api.put(`/bracket/${match.id}`, { winner: null, scoreStr: null, setsWinner: null, setsLoser: null, status: 'SCHEDULED' })
      show('Resultado limpiado ✓')
      onSaved()
    } catch (e) { show('Error.', 'error') }
    finally { setSaving(false) }
  }

  const roundLabels = {
    'R128': '1ra ronda', 'R64': '2da ronda', 'R32': '3ra ronda', 'R16': '4ta ronda',
    'QF': 'Cuartos de final', 'SF': 'Semifinal', 'F': 'Final',
  }

  const loserName = form.player1 && form.player2
    ? (autoWinner === form.player1 ? form.player2 : form.player1)
    : ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', width: '100%', maxWidth: 430, maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.white18, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white50 }}>{roundLabels[match.round] || match.round} · Partido #{match.positionInRound}</div>
          <button onClick={onClose} style={{ background: C.white06, border: 'none', color: C.white35, width: 28, height: 28, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: C.white25, marginBottom: 12 }}>
          Cargá los jugadores y el resultado por sets. El ganador se determina automáticamente.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Jugador 1</label>
          <input type="text" placeholder="Nombre completo" value={form.player1}
            onChange={e => setForm(f => ({ ...f, player1: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Jugador 2</label>
          <input type="text" placeholder="Nombre completo" value={form.player2}
            onChange={e => setForm(f => ({ ...f, player2: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px', outline: 'none' }} />
        </div>

        {form.player1 && form.player2 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>Resultado por set</div>
            <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div />
              {['Set 1','Set 2','Set 3','Set 4','Set 5'].map(s => (
                <div key={s} style={{ fontSize: 9, color: C.white18, textAlign: 'center', fontWeight: 600 }}>{s}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: autoWinner === form.player1 ? C.green : C.white35,
                display: 'flex', alignItems: 'center', overflow: 'hidden',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 9 }}>
                  {form.player1.split(' ').pop()}
                </span>
              </div>
              {form.sets.map((s, i) => (
                <input key={i} type="number" min="0" max="7" value={s.w}
                  onChange={e => setSetScore(i, 'w', e.target.value)}
                  style={{
                    height: 34, borderRadius: 5, textAlign: 'center',
                    fontSize: 14, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
                    border: `1px solid ${s.w !== '' ? 'rgba(76,175,80,.2)' : 'rgba(255,255,255,.08)'}`,
                    background: s.w !== '' ? 'rgba(76,175,80,.12)' : 'rgba(255,255,255,.04)',
                    color: s.w !== '' ? C.green : C.white18,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(5, 1fr)', gap: 4, marginBottom: 4 }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: autoWinner === form.player2 ? C.green : C.white35,
                display: 'flex', alignItems: 'center', overflow: 'hidden',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 9 }}>
                  {form.player2.split(' ').pop()}
                </span>
              </div>
              {form.sets.map((s, i) => (
                <input key={i} type="number" min="0" max="7" value={s.l}
                  onChange={e => setSetScore(i, 'l', e.target.value)}
                  style={{
                    height: 34, borderRadius: 5, textAlign: 'center',
                    fontSize: 14, fontWeight: 700, width: '100%', padding: 0, outline: 'none',
                    border: `1px solid ${s.l !== '' ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.08)'}`,
                    background: 'rgba(255,255,255,.04)',
                    color: s.l !== '' ? C.white35 : C.white18,
                  }}
                />
              ))}
            </div>

            {/* Resumen auto */}
            {filledSets > 0 && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 10,
                background: autoWinner ? 'rgba(76,175,80,.06)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${autoWinner ? 'rgba(76,175,80,.12)' : C.white12}`,
                fontSize: 12, fontWeight: 600,
                color: autoWinner ? C.green : C.white18,
                textAlign: 'center',
              }}>
                {autoWinner
                  ? `${autoWinner.split(' ').pop()} gana ${setsWinner}-${setsLoser}`
                  : `Sets: ${setsWinner}-${setsLoser} (sin ganador claro aún)`}
              </div>
            )}
          </>
        )}

        <button onClick={save} disabled={saving} style={{ marginBottom: 8, marginTop: 16, width: '100%', background: C.green, color: '#fff', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          {saving ? 'Guardando...' : 'Guardar partido'}
        </button>
        {match.winner && (
          <button onClick={clearResult} disabled={saving} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(244,67,54,.15)', color: 'rgba(244,67,54,.6)', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Limpiar resultado
          </button>
        )}
      </div>
    </div>
  )
}