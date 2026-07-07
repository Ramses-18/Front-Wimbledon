import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
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
  white08:    'rgba(255,255,255,.08)',
  white06:    'rgba(255,255,255,.06)',
  white04:    'rgba(255,255,255,.04)',
  gold:       '#C8A951',
  red:        '#f44336',
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: C.white04, border: '1px solid ' + C.white08,
  borderRadius: 8, color: C.white50, fontSize: 13, padding: '10px 12px',
  outline: 'none',
}

export default function RankingPage() {
  const { user } = useAuth()
  const { show } = useToast()
  const isAdmin = user?.role === 'ADMIN'

  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newPoints, setNewPoints] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPoints, setEditPoints] = useState('')

  const fetchRanking = () => {
    setLoading(true)
    api.get('/atp-ranking')
      .then(r => setRanking(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRanking() }, [])

  const handleAdd = () => {
    if (!newName.trim() || !newPoints) return
    api.post('/atp-ranking', { playerName: newName.trim(), points: parseInt(newPoints) })
      .then(() => {
        setNewName('')
        setNewPoints('')
        show('Jugador agregado')
        fetchRanking()
      })
      .catch(e => show(e.response?.data?.message || 'Error al agregar', 'error'))
  }

  const handleUpdate = (id) => {
    if (!editPoints) return
    api.put(`/atp-ranking/${id}`, { playerName: editName.trim(), points: parseInt(editPoints) })
      .then(() => {
        setEditingId(null)
        show('Jugador actualizado')
        fetchRanking()
      })
      .catch(e => show(e.response?.data?.message || 'Error al actualizar', 'error'))
  }

  const handleDelete = (id) => {
    if (!confirm('Eliminar este jugador del ranking?')) return
    api.delete(`/atp-ranking/${id}`)
      .then(() => { show('Jugador eliminado'); fetchRanking() })
      .catch(() => show('Error al eliminar', 'error'))
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setEditName(r.playerName)
    setEditPoints(String(r.points))
  }

  const posColor = (i) => {
    if (i === 0) return { bg: C.gold, color: '#fff' }
    if (i === 1) return { bg: 'rgba(255,255,255,.2)', color: C.white50 }
    if (i === 2) return { bg: 'rgba(193,154,107,.3)', color: 'rgba(255,255,255,.7)' }
    return { bg: C.white06, color: C.white25 }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: C.greenDeep, zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 16px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300,
            color: 'rgba(255,255,255,.8)', letterSpacing: '.04em', margin: 0,
          }}>Ranking ATP</h2>
          <p style={{
            fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em',
            textTransform: 'uppercase', marginTop: 4, marginBottom: 0,
          }}>
            {isAdmin ? 'Gestión de jugadores y puntos' : 'Ranking actualizado de jugadores'}
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" />
            <p style={{ fontSize: 13, color: C.white25, marginTop: 10 }}>Cargando...</p>
          </div>
        )}

        {/* Admin: Add button */}
        {isAdmin && !loading && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowAdd(f => !f)}
              style={{
                width: '100%', borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600,
                background: showAdd ? 'transparent' : C.white04,
                border: showAdd ? '1px solid rgba(244,67,54,.2)' : '1px solid ' + C.white08,
                color: showAdd ? 'rgba(244,67,54,.7)' : 'rgba(255,255,255,.5)',
                cursor: 'pointer', letterSpacing: '.02em',
              }}>
              {showAdd ? '✕ Cerrar' : '+ Agregar jugador'}
            </button>
          </div>
        )}

        {/* Admin: Add form */}
        {isAdmin && showAdd && (
          <div style={{
            marginBottom: 20, background: C.white04,
            border: '1px solid ' + C.white08, borderRadius: 14, padding: 16,
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Nombre
                </label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Nombre del jugador"
                  style={inputStyle}
                />
              </div>
              <div style={{ width: 100 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: C.white25, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                  Puntos
                </label>
                <input
                  type="number"
                  value={newPoints}
                  onChange={e => setNewPoints(e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newPoints}
              style={{
                width: '100%', background: C.green, color: '#fff',
                borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                opacity: (!newName.trim() || !newPoints) ? .4 : 1,
              }}>
              Agregar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && ranking.length === 0 && (
          <p style={{ padding: 24, fontSize: 12, color: C.white18, textAlign: 'center' }}>
            No hay jugadores en el ranking todavía.
          </p>
        )}

        {/* Ranking list */}
        {!loading && ranking.length > 0 && (
          <div style={{
            background: C.white04, border: '1px solid ' + C.white06,
            borderRadius: 14, overflow: 'hidden',
          }}>
            {ranking.map((r, i) => {
              const isEditing = editingId === r.id
              const pc = posColor(i)
              const isLast = i === ranking.length - 1
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '14px 16px', gap: 12,
                  borderBottom: isLast ? 'none' : '1px solid ' + C.white06,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.white06}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Position badge */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFeatureSettings: '"tnum"',
                    background: pc.bg, color: pc.color,
                  }}>
                    {i + 1}
                  </div>

                  {isEditing && isAdmin ? (
                    <>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{
                          flex: 1, padding: '6px 8px', borderRadius: 6,
                          border: '1px solid ' + C.white08, background: C.white04,
                          color: C.white50, fontSize: 13, outline: 'none',
                        }}
                      />
                      <input
                        type="number"
                        value={editPoints}
                        onChange={e => setEditPoints(e.target.value)}
                        style={{
                          width: 80, padding: '6px 8px', borderRadius: 6,
                          border: '1px solid ' + C.white08, background: C.white04,
                          color: C.white50, fontSize: 13, outline: 'none',
                        }}
                      />
                      <button onClick={() => handleUpdate(r.id)} style={{
                        background: 'rgba(76,175,80,.15)', border: '1px solid rgba(76,175,80,.2)',
                        color: C.green, padding: '6px 10px', borderRadius: 6,
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      }}>
                        OK
                      </button>
                      <button onClick={() => setEditingId(null)} style={{
                        background: C.white06, border: '1px solid ' + C.white08,
                        color: C.white35, padding: '6px 10px', borderRadius: 6,
                        cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      }}>
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Name */}
                      <div style={{
                        flex: 1, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.7)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '-.01em',
                      }}>
                        {r.playerName}
                      </div>
                      {/* Points */}
                      <div style={{
                        fontSize: 15, fontWeight: 700, color: C.green,
                        fontFeatureSettings: '"tnum"', minWidth: 55, textAlign: 'right',
                        letterSpacing: '-.02em',
                      }}>
                        {r.points.toLocaleString()}
                        <span style={{ fontSize: 9, fontWeight: 500, color: C.white18, marginLeft: 3, letterSpacing: '.02em' }}>pts</span>
                      </div>
                      {/* Admin actions */}
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                          <button onClick={() => startEdit(r)} style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: 13, color: C.white25, padding: '4px 6px', borderRadius: 6,
                            transition: 'color .15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = C.white50}
                          onMouseLeave={e => e.currentTarget.style.color = C.white25}
                          >
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: 13, color: 'rgba(244,67,54,.4)', padding: '4px 6px', borderRadius: 6,
                            transition: 'color .15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'rgba(244,67,54,.7)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,67,54,.4)'}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {isAdmin && !loading && ranking.length > 0 && (
          <p style={{ fontSize: 10, color: C.white12, marginTop: 10, textAlign: 'center', letterSpacing: '.04em' }}>
            {ranking.length}/100 jugadores cargados
          </p>
        )}
      </div>
    </div>
  )
}