import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../context/AuthContext.jsx'
import MatchCard from '../components/MatchCard.jsx'

const G = 'var(--green)'
const BORDER = 'var(--border)'

// Ahora el back manda status autoritativo, no calculamos por horario
function getMatchStatus(match) {
  switch (match.status) {
    case 'FINISHED':
    case 'WALKOVER':
    case 'ABANDONED':
    case 'RETIRED':
      return 'terminado'
    case 'IN_PLAY':
    case 'SUSPENDED':
      return 'jugando'
    case 'SCHEDULED':
    default:
      return 'por_jugar'
  }
}

export default function TodayPage() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('por_jugar')
  const [groupByCourt, setGroupByCourt] = useState(true)  // agrupar por cancha

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/today')
      setMatches(data)

      // Auto-seleccionar filtro según el estado predominante
      const jugando    = data.filter(m => getMatchStatus(m) === 'jugando').length
      const terminados = data.filter(m => getMatchStatus(m) === 'terminado').length
      const porJugar   = data.filter(m => getMatchStatus(m) === 'por_jugar').length

      if (jugando > 0)         setFilter('jugando')
      else if (porJugar > 0)   setFilter('por_jugar')
      else if (terminados > 0) setFilter('terminado')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Refrescar cada 2 minutos para actualizar scores en vivo
    const interval = setInterval(load, 120_000)
    return () => clearInterval(interval)
  }, [load])

  const jugando    = matches.filter(m => getMatchStatus(m) === 'jugando')
  const porJugar   = matches.filter(m => getMatchStatus(m) === 'por_jugar')
  const terminados = matches.filter(m => getMatchStatus(m) === 'terminado')

  const FILTERS = [
    { key: 'jugando',   label: '🔴 En juego',   count: jugando.length,    color: 'var(--danger)' },
    { key: 'por_jugar', label: '⏳ Por jugar',   count: porJugar.length,   color: G },
    { key: 'terminado', label: '✓ Terminados',   count: terminados.length, color: 'var(--text-muted)' },
  ]

  const visible = filter === 'jugando' ? jugando
    : filter === 'por_jugar' ? porJugar
    : terminados

  // Agrupar por cancha (cola por cancha)
  const byCourt = visible.reduce((acc, m) => {
    const court = m.court || 'Sin cancha'
    ;(acc[court] = acc[court] || []).push(m)
    return acc
  }, {})

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 2 }}>Partidos de hoy</h2>
      <p className="text-muted mb-12">
        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {loading && <div className="spinner" />}

      {!loading && matches.length === 0 && (
        <div className="empty-state">
          <div className="icon">🎾</div>
          <p>No hay partidos cargados para hoy.</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          {/* Filtros */}
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

          {/* Toggle agrupar por cancha */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setGroupByCourt(v => !v)} style={{
              padding: '4px 10px', fontSize: 10, fontWeight: 600,
              borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${groupByCourt ? G : BORDER}`,
              background: groupByCourt ? G : 'var(--card-bg)',
              color: groupByCourt ? 'var(--card-bg)' : 'var(--text-muted)',
            }}>
              {groupByCourt ? '🏟️ Agrupado por cancha' : '📋 Lista simple'}
            </button>
          </div>

          {/* Lista de partidos */}
          {visible.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="icon" style={{ fontSize: 32 }}>
                {filter === 'jugando' ? '⏳' : filter === 'por_jugar' ? '🎾' : '✓'}
              </div>
              <p>
                {filter === 'jugando'   ? 'No hay partidos en curso ahora.' :
                 filter === 'por_jugar' ? 'No hay partidos pendientes.' :
                 'No hay partidos terminados aún.'}
              </p>
            </div>
          ) : groupByCourt ? (
            // Vista agrupada por cancha
            Object.entries(byCourt).map(([court, courtMatches]) => (
              <div key={court} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: G,
                  marginBottom: 8, paddingLeft: 4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  🏟️ {court}
                  <span style={{
                    fontSize: 10, color: 'var(--text-muted)', fontWeight: 500,
                    background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 10,
                  }}>{courtMatches.length} {courtMatches.length === 1 ? 'partido' : 'partidos'}</span>
                </div>
                {courtMatches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    status={getMatchStatus(m)}
                    onRefresh={load}
                  />
                ))}
              </div>
            ))
          ) : (
            // Vista plana
            visible.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                status={getMatchStatus(m)}
                onRefresh={load}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}