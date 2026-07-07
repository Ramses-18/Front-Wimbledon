import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../context/AuthContext.jsx'
import MatchCard from '../components/MatchCard.jsx'

const G = 'var(--green)'
const BORDER = 'var(--border)'

function getMatchStatus(match) {
  switch (match.status) {
  case 'FINISHED':
  case 'WALKOVER':
  case 'ABANDONED':
  case 'RETIRED':
    return 'terminado'
  case 'IN_PLAY':
    return 'jugando'
  case 'SUSPENDED':
    return 'suspendido'
  case 'SCHEDULED':
  default:
    return 'por_jugar'
  }
}

function getMatchDateLabel(match) {
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-CA')
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA')
  const matchDate = match.matchDate
  if (matchDate === todayStr) return 'hoy'
  if (matchDate === tomorrowStr) return 'manana'
  return 'otro'
}

export default function TodayPage() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('por_jugar')
  const [groupByCourt, setGroupByCourt] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/upcoming')
      setMatches(data)

      const jugando     = data.filter(m => getMatchStatus(m) === 'jugando').length
      const suspendidos = data.filter(m => getMatchStatus(m) === 'suspendido').length
      const porJugar    = data.filter(m => getMatchStatus(m) === 'por_jugar').length
      const terminados  = data.filter(m => getMatchStatus(m) === 'terminado').length

      if (jugando > 0)          setFilter('jugando')
      else if (suspendidos > 0) setFilter('suspendido')
      else if (porJugar > 0)    setFilter('por_jugar')
      else if (terminados > 0)  setFilter('terminado')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 120_000)
    return () => clearInterval(interval)
  }, [load])

  const jugando     = matches.filter(m => getMatchStatus(m) === 'jugando')
  const suspendidos = matches.filter(m => getMatchStatus(m) === 'suspendido')
  const porJugar    = matches.filter(m => getMatchStatus(m) === 'por_jugar')
  const terminados  = matches.filter(m => getMatchStatus(m) === 'terminado')

  const FILTERS = [
    { key: 'jugando',    label: 'En juego',    count: jugando.length,     color: 'var(--danger)' },
    { key: 'suspendido', label: 'Suspendido',  count: suspendidos.length, color: '#E65100' },
    { key: 'por_jugar',  label: 'Por jugar',   count: porJugar.length,    color: G },
    { key: 'terminado',  label: 'Terminados',  count: terminados.length,  color: 'var(--text-muted)' },
  ].filter(f => f.count > 0)

  // Auto-select first available filter if current is empty
  if (FILTERS.length > 0 && !FILTERS.find(f => f.key === filter)) {
    setFilter(FILTERS[0].key)
  }

  const visible = filter === 'jugando' ? jugando
    : filter === 'suspendido' ? suspendidos
    : filter === 'por_jugar' ? porJugar
    : terminados

  // Separar en reanudados, hoy y mañana
  const otherMatches = visible.filter(m => getMatchDateLabel(m) === 'otro')
  const todayMatches = visible.filter(m => getMatchDateLabel(m) === 'hoy')
  const tomorrowMatches = visible.filter(m => getMatchDateLabel(m) === 'manana')

  const renderGroup = (courtMatches) => {
    const byCourt = courtMatches.reduce((acc, m) => {
      const court = m.court || 'Sin cancha'
      ;(acc[court] = acc[court] || []).push(m)
      return acc
    }, {})

    if (groupByCourt) {
      return Object.entries(byCourt).map(([court, cMatches]) => (
        <div key={court} style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: G,
            marginBottom: 8, paddingLeft: 4,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {court}
            <span style={{
              fontSize: 10, color: 'var(--text-muted)', fontWeight: 500,
              background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 10,
            }}>{cMatches.length} {cMatches.length === 1 ? 'partido' : 'partidos'}</span>
          </div>
          {cMatches.map(m => (
            <MatchCard key={m.id} match={m} status={getMatchStatus(m)} onRefresh={load} />
          ))}
        </div>
      ))
    }

    return courtMatches.map(m => (
      <MatchCard key={m.id} match={m} status={getMatchStatus(m)} onRefresh={load} />
    ))
  }

  const todayStr = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 2 }}>Partidos</h2>
      <p className="text-muted" style={{ marginBottom: 16 }}>{todayStr}</p>

      {loading && <div className="spinner" />}

      {!loading && matches.length === 0 && (
        <div className="empty-state">
          <div className="icon">🎾</div>
          <p>No hay partidos cargados para hoy ni mañana.</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                flex: 1, padding: '8px 4px',
                borderRadius: 8,
                border: `1px solid ${filter === f.key ? G : BORDER}`,
                background: filter === f.key ? G : 'var(--card-bg)',
                color: filter === f.key ? 'var(--card-bg)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                position: 'relative',
              }}>
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -4,
                    background: filter === f.key ? 'var(--gold)' : f.color,
                    color: 'var(--card-bg)', fontSize: 9, fontWeight: 700,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.count}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setGroupByCourt(v => !v)} style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 600,
              borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${groupByCourt ? G : BORDER}`,
              background: groupByCourt ? G : 'var(--card-bg)',
              color: groupByCourt ? 'var(--card-bg)' : 'var(--text-muted)',
            }}>
              {groupByCourt ? 'Agrupado por cancha' : 'Lista simple'}
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="icon" style={{ fontSize: 32 }}>
                {filter === 'jugando' ? '⏳' : filter === 'suspendido' ? '⏸️' : filter === 'por_jugar' ? '🎾' : '✓'}
              </div>
              <p>
                {filter === 'jugando'    ? 'No hay partidos en curso ahora.' :
                 filter === 'suspendido' ? 'No hay partidos suspendidos.' :
                 filter === 'por_jugar'  ? 'No hay partidos pendientes.' :
                 'No hay partidos terminados aún.'}
              </p>
            </div>
          ) : (
            <>
              {/* Reanudados (partidos de días anteriores) */}
              {otherMatches.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#E65100', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Reanudados ({otherMatches.length})
                  </div>
                  {renderGroup(otherMatches)}
                </>
              )}

              {/* Hoy */}
              {todayMatches.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: otherMatches.length > 0 ? 16 : 0 }}>
                    Hoy ({todayMatches.length})
                  </div>
                  {renderGroup(todayMatches)}
                </>
              )}

              {/* Mañana */}
              {tomorrowMatches.length > 0 && (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: (otherMatches.length > 0 || todayMatches.length > 0) ? 8 : 0 }}>
                    Mañana ({tomorrowMatches.length})
                  </div>
                  {renderGroup(tomorrowMatches)}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}