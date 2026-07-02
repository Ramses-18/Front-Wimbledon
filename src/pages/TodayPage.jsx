// /////////////////////////////////////////////////////////////
import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../context/AuthContext.jsx'
import MatchCard from '../components/MatchCard.jsx'

const G = '#1B5E20'
const BORDER = '#E0E0D8'

function getMatchStatus(match) {
  const now = new Date()
  const start = new Date(`${match.matchDate}T${match.matchTime}`)
  const deadline = new Date(start.getTime() - 5 * 60 * 1000)

  if (match.result) return 'terminado'
  if (now >= start) return 'jugando'
  return 'por_jugar'
}

export default function TodayPage() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('por_jugar')

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
    { key: 'jugando',   label: '🔴 En juego',   count: jugando.length,    color: '#C62828' },
    { key: 'por_jugar', label: '⏳ Por jugar',   count: porJugar.length,   color: G },
    { key: 'terminado', label: '✓ Terminados',   count: terminados.length, color: '#888' },
  ]

  const visible = filter === 'jugando' ? jugando
    : filter === 'por_jugar' ? porJugar
    : terminados

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
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                flex: 1, padding: '8px 4px',
                borderRadius: 8,
                border: `1px solid ${filter === f.key ? G : BORDER}`,
                background: filter === f.key ? G : '#fff',
                color: filter === f.key ? '#fff' : '#888',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                position: 'relative',
              }}>
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -4,
                    background: filter === f.key ? '#C9A84C' : f.color,
                    color: '#fff', fontSize: 9, fontWeight: 700,
                    width: 16, height: 16, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.count}</span>
                )}
              </button>
            ))}
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
          ) : (
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