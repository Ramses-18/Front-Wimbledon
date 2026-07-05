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
  case 'SUSPENDED':
    return 'jugando'
  case 'SCHEDULED':
  default:
    return 'por_jugar'
  }
}

function fmtFecha(fecha) {
  if (!fecha) return ''
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function TodayPage() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('por_jugar')
  const [groupByCourt, setGroupByCourt] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/all')
      setMatches(data)
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

  const jugando    = matches.filter(m => getMatchStatus(m) === 'jugando')
  const porJugar   = matches.filter(m => getMatchStatus(m) === 'por_jugar')
  const terminados = matches.filter(m => getMatchStatus(m) === 'terminado')

  // Auto-select filter
  useEffect(() => {
    if (jugando.length > 0) setFilter('jugando')
    else if (porJugar.length > 0) setFilter('por_jugar')
    else if (terminados.length > 0) setFilter('terminado')
  }, [matches])

  const FILTERS = [
    { key: 'jugando',   label: 'En juego',   count: jugando.length,    color: 'var(--danger)' },
    { key: 'por_jugar', label: 'Por jugar',   count: porJugar.length,   color: G },
    { key: 'terminado', label: 'Terminados',   count: terminados.length, color: 'var(--text-muted)' },
  ]

  const filtered = filter === 'jugando' ? jugando
    : filter === 'por_jugar' ? porJugar
    : terminados

  // Group by date, then optionally by court
  const byDate = filtered.reduce((acc, m) => {
    const date = m.matchDate || 'sin-fecha'
    ;(acc[date] = acc[date] || []).push(m)
    return acc
  }, {})

  // Sort dates descending (most recent first)
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 2 }}>Partidos</h2>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Todos los partidos del torneo
      </p>

      {loading && <div className="spinner" />}

      {!loading && matches.length === 0 && (
        <div className="empty-state">
          <div className="icon">🎾</div>
          <p>No hay partidos cargados.</p>
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
              {groupByCourt ? 'Agrupado por cancha' : 'Lista simple'}
            </button>
          </div>

          {/* Lista de partidos agrupados por fecha */}
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="icon" style={{ fontSize: 32 }}>
                {filter === 'jugando' ? '⏳' : filter === 'por_jugar' ? '🎾' : '✓'}
              </div>
              <p>
                {filter === 'jugando'   ? 'No hay partidos en curso.' :
                 filter === 'por_jugar' ? 'No hay partidos pendientes.' :
                 'No hay partidos terminados.'}
              </p>
            </div>
          ) : (
            sortedDates.map(date => {
              const dateMatches = byDate[date]
              return (
                <div key={date} style={{ marginBottom: 20 }}>
                  {/* Date header */}
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                    marginBottom: 10, paddingLeft: 4,
                    textTransform: 'capitalize',
                  }}>
                    {fmtFecha(date)}
                  </div>

                  {groupByCourt ? (
                    // Group by court within this date
                    (() => {
                      const courts = dateMatches.reduce((acc, m) => {
                        const c = m.court || 'Sin cancha'
                        ;(acc[c] = acc[c] || []).push(m)
                        return acc
                      }, {})
                      return Object.entries(courts).map(([court, courtMatches]) => (
                        <div key={court} style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700, color: G,
                            marginBottom: 6, paddingLeft: 4,
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                            {court}
                            <span style={{
                              fontSize: 9, color: 'var(--text-muted)', fontWeight: 500,
                              background: 'var(--green-pale)', padding: '2px 8px', borderRadius: 10,
                            }}>{courtMatches.length}</span>
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
                    })()
                  ) : (
                    dateMatches.map(m => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        status={getMatchStatus(m)}
                        onRefresh={load}
                      />
                    ))
                  )}
                </div>
              )
            })
          )}
        </>
      )}
    </div>
  )
}