import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../context/AuthContext.jsx'
import MatchCard from '../components/MatchCard.jsx'

// ── Colour tokens (dark Centre Court) ──
const C = {
  bg:         '#0a1a0f',
  green:      '#1B5E20',
  greenLight: 'rgba(76,175,80,.35)',
  greenPale:  'rgba(76,175,80,.08)',
  white:      '#fff',
  white12:    'rgba(255,255,255,.12)',
  white06:    'rgba(255,255,255,.06)',
  white45:    'rgba(255,255,255,.45)',
  white35:    'rgba(255,255,255,.35)',
  white25:    'rgba(255,255,255,.25)',
  white18:    'rgba(255,255,255,.18)',
  gold:       '#C8A951',
  orange:     '#E65100',
  red:        '#f44336',
}

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

// ── Tiny animated dot ──
function LiveDot({ color = C.red }) {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: color, marginRight: 5, flexShrink: 0,
      animation: 'pulse 1.4s infinite',
    }} />
  )
}

// ── Section heading (Reanudados / Hoy / Mañana) ──
function SectionLabel({ text, color, count }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color, letterSpacing: '.08em',
      textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 4, height: 14, borderRadius: 2, background: color }} />
      {text}
      <span style={{
        fontSize: 9, fontWeight: 600, color: C.white25,
        background: C.white06, padding: '1px 7px', borderRadius: 8,
      }}>{count}</span>
    </div>
  )
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
    { key: 'jugando',    label: 'En juego',    count: jugando.length,     dot: C.red,    activeDot: false },
    { key: 'suspendido', label: 'Suspendido',  count: suspendidos.length, dot: C.orange,  activeDot: false },
    { key: 'por_jugar',  label: 'Por jugar',   count: porJugar.length,    dot: null,      activeDot: false },
    { key: 'terminado',  label: 'Terminados',  count: terminados.length,  dot: null,      activeDot: false },
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
  const otherMatches    = visible.filter(m => getMatchDateLabel(m) === 'otro')
  const todayMatches    = visible.filter(m => getMatchDateLabel(m) === 'hoy')
  const tomorrowMatches = visible.filter(m => getMatchDateLabel(m) === 'manana')

  const renderGroup = (courtMatches) => {
    const byCourt = courtMatches.reduce((acc, m) => {
      const court = m.court || 'Sin cancha'
      ;(acc[court] = acc[court] || []).push(m)
      return acc
    }, {})

    if (groupByCourt) {
      return Object.entries(byCourt).map(([court, cMatches]) => (
        <div key={court} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: C.greenLight,
            letterSpacing: '.1em', textTransform: 'uppercase',
            marginBottom: 8, paddingLeft: 4,
          }}>
            {court} <span style={{ color: C.white25, marginLeft: 4 }}>{cMatches.length}</span>
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

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, paddingBottom: 80,
    }}>
      {/* Grass gradient overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 300, pointerEvents: 'none', zIndex: 0,
        background: 'linear-gradient(180deg, rgba(27,94,32,.12) 0%, transparent 100%)',
      }} />

      {/* Green left stripe */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 4,
        background: C.green, zIndex: 10,
      }} />

      {/* Header */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '8px 20px 0',
      }}>
        <div>
          <p style={{
            fontSize: 10, letterSpacing: '.2em', color: 'rgba(255,255,255,.25)',
            textTransform: 'uppercase', margin: 0,
          }}>Partidos</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', margin: '4px 0 0', fontWeight: 500 }}>
            {todayStr}
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div style={{
            width: 24, height: 24, border: `2px solid ${C.white18}`,
            borderTopColor: C.green, borderRadius: '50%',
            animation: 'spin .7s linear infinite',
          }} />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: .3 }}>🎾</div>
          <p style={{ color: C.white25, fontSize: 13 }}>
            No hay partidos cargados para hoy ni mañana.
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 0' }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {FILTERS.map(f => {
              const isActive = filter === f.key
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  flex: 1, padding: '9px 6px',
                  borderRadius: 20,
                  border: `1px solid ${isActive ? 'transparent' : C.white12}`,
                  background: isActive ? C.green : 'transparent',
                  color: isActive ? C.white : C.white45,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  transition: 'all .15s',
                }}>
                  {f.dot && <LiveDot color={isActive ? C.white : f.dot} />}
                  {f.label}
                  {f.count > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      padding: '1px 5px', borderRadius: 8,
                      background: isActive ? C.gold : C.white06,
                      color: isActive ? C.bg : C.white45,
                    }}>{f.count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Group toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <button onClick={() => setGroupByCourt(v => !v)} style={{
              padding: '5px 12px', fontSize: 10, fontWeight: 600,
              borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${groupByCourt ? C.green : C.white12}`,
              background: groupByCourt ? C.green : 'transparent',
              color: groupByCourt ? C.white : C.white35,
              transition: 'all .15s',
            }}>
              {groupByCourt ? 'Por cancha' : 'Lista'}
            </button>
          </div>

          {visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: .25 }}>
                {filter === 'jugando' ? '⏳' : filter === 'suspendido' ? '⏸' : filter === 'por_jugar' ? '🎾' : '✓'}
              </div>
              <p style={{ color: C.white25, fontSize: 12 }}>
                {filter === 'jugando'    ? 'No hay partidos en curso ahora.' :
                 filter === 'suspendido' ? 'No hay partidos suspendidos.' :
                 filter === 'por_jugar'  ? 'No hay partidos pendientes.' :
                 'No hay partidos terminados aún.'}
              </p>
            </div>
          ) : (
            <>
              {/* Reanudados */}
              {otherMatches.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <SectionLabel text="Reanudados" color={C.orange} count={otherMatches.length} />
                  {renderGroup(otherMatches)}
                </div>
              )}

              {/* Hoy */}
              {todayMatches.length > 0 && (
                <div style={{ marginTop: otherMatches.length > 0 ? 16 : 8 }}>
                  <SectionLabel text="Hoy" color={C.white35} count={todayMatches.length} />
                  {renderGroup(todayMatches)}
                </div>
              )}

              {/* Mañana */}
              {tomorrowMatches.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <SectionLabel text="Mañana" color={C.white35} count={tomorrowMatches.length} />
                  {renderGroup(tomorrowMatches)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}