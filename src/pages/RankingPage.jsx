import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const G = 'var(--green)'

export default function RankingPage() {
  const { user } = useAuth()
  const { show } = useToast()
  const isAdmin = user?.role === 'ADMIN'

  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newPoints, setNewPoints] = useState('')
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

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{
        fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700,
        marginBottom: 2, color: 'var(--text)',
      }}>Ranking ATP</h1>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        {isAdmin ? 'Gestioná los jugadores y sus puntos' : 'Ranking actualizado de jugadores'}
      </p>

      {loading && <div className="spinner" />}

      {/* Formulario admin para agregar */}
      {isAdmin && !loading && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 14, marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
            Agregar jugador
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre del jugador"
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text)', fontSize: 13,
              }}
            />
            <input
              type="number"
              value={newPoints}
              onChange={e => setNewPoints(e.target.value)}
              placeholder="Puntos"
              style={{
                width: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--input-bg)', color: 'var(--text)', fontSize: 13,
              }}
            />
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-primary btn-full"
            disabled={!newName.trim() || !newPoints}
          >
            Agregar
          </button>
        </div>
      )}

      {/* Lista de ranking */}
      {!loading && ranking.length === 0 && (
        <div className="empty-state">
          <p>No hay jugadores en el ranking todavía.</p>
        </div>
      )}

      {!loading && ranking.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {ranking.map((r, i) => {
            const isEditing = editingId === r.id
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 14px', gap: 12,
                borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                {/* Posición */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: i === 0 ? 'var(--gold)' : i === 1 ? '#9E9E9E' : i === 2 ? '#A1887F' : 'var(--border)',
                  color: i < 3 ? 'white' : 'var(--text-mid)',
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
                        border: '1px solid var(--border)', background: 'var(--input-bg)',
                        color: 'var(--text)', fontSize: 13,
                      }}
                    />
                    <input
                      type="number"
                      value={editPoints}
                      onChange={e => setEditPoints(e.target.value)}
                      style={{
                        width: 80, padding: '6px 8px', borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--input-bg)',
                        color: 'var(--text)', fontSize: 13,
                      }}
                    />
                    <button onClick={() => handleUpdate(r.id)} style={{
                      background: G, border: 'none', color: 'white',
                      padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      OK
                    </button>
                    <button onClick={() => setEditingId(null)} style={{
                      background: 'var(--border)', border: 'none', color: 'var(--text)',
                      padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                    }}>
                      X
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{
                      flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.playerName}
                    </div>
                    <div style={{
                      fontSize: 16, fontWeight: 700, color: G,
                      fontFeatureSettings: '"tnum"', minWidth: 50, textAlign: 'right',
                    }}>
                      {r.points.toLocaleString()}
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 3 }}>pts</span>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                        <button onClick={() => startEdit(r)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 14, color: 'var(--text-muted)', padding: '2px 4px',
                        }}>
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(r.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 14, color: '#e53935', padding: '2px 4px',
                        }}>
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
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
          {ranking.length}/100 jugadores cargados
        </p>
      )}
    </div>
  )
}