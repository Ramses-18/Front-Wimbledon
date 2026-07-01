import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../context/AuthContext.jsx'
import MatchCard from '../components/MatchCard.jsx'

function DeadlineBanner({ matches }) {
  if (!matches.length) return null
  const first    = matches[0]
  const deadline = new Date(`${first.matchDate}T${first.matchTime}`)
  deadline.setMinutes(deadline.getMinutes() - 1)
  const closed = new Date() > deadline
  const fmt    = deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      background: '#1B5E20', borderRadius: 10, padding: '10px 14px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 16,
    }}>

      <span style={{
        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
        background: closed ? '#FFCDD2' : '#C8E6C9',
        color: closed ? '#B71C1C' : '#1B5E20',
      }}>
        {closed ? 'Cerrado' : 'Abierto'}
      </span>
    </div>
  )
}

export default function TodayPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/today')
      setMatches(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Partidos de hoy</h2>
      <p className="text-muted mb-12">
        {new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
      </p>

      {loading && <div className="spinner" />}

      {!loading && matches.length === 0 && (
        <div className="empty-state">
          <div className="icon">🎾</div>
          <p>No hay partidos cargados para hoy.<br />El admin puede agregarlos desde el panel.</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <>
          <DeadlineBanner matches={matches} />
          {matches.map(m => (
            <MatchCard key={m.id} match={m} onRefresh={load} />
          ))}
        </>
      )}
    </div>
  )
}
