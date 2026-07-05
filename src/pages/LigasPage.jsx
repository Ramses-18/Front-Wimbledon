import React, { useState, useEffect } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'

const G = 'var(--green)'
const BORDER = 'var(--border)'

export default function LigasPage() {
  const { show } = useToast()
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/leagues/my')
      setLeagues(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) { show('Poné un nombre a la liga', 'error'); return }
    setBusy(true)
    try {
      const { data } = await api.post('/leagues', { name: newName.trim() })
      show('Liga "' + data.name + '" creada! Codigo: ' + data.code)
      setNewName('')
      setShowCreate(false)
      load()
    } catch (e) {
      show(e.response?.data?.error || 'Error al crear liga', 'error')
    } finally { setBusy(false) }
  }

  const join = async () => {
    if (!joinCode.trim()) { show('Ingresá el codigo de la liga', 'error'); return }
    setBusy(true)
    try {
      const { data } = await api.post('/leagues/join', { code: joinCode.trim().toUpperCase() })
      show('Te uniste a "' + data.name + '"!')
      setJoinCode('')
      setShowJoin(false)
      load()
    } catch (e) {
      show(e.response?.data?.error || 'Error al unirse', 'error')
    } finally { setBusy(false) }
  }

  const leave = async (leagueId, leagueName) => {
    if (!confirm('Seguro que queres salir de "' + leagueName + '"?')) return
    try {
      await api.post(`/leagues/${leagueId}/leave`)
      show('Saliste de la liga')
      load()
    } catch (e) {
      show(e.response?.data?.error || 'Error', 'error')
    }
  }

  const deleteLeague = async (leagueId, leagueName) => {
    if (!confirm('Eliminar la liga "' + leagueName + '"? Se perderan los datos.')) return
    try {
      await api.delete(`/leagues/${leagueId}`)
      show('Liga eliminada')
      load()
    } catch (e) {
      show(e.response?.data?.error || 'Error', 'error')
    }
  }

  const viewLeaderboard = (leagueId) => {
    navigate(`/ligas/${leagueId}`)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 2 }}>Ligas Privadas</h2>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Competí con amigos en tablas exclusivas
      </p>

      {loading && <div className="spinner" />}

      {!loading && (
        <>
          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
              Crear liga
            </button>
            <button onClick={() => setShowJoin(true)} className="btn btn-outline" style={{ flex: 1, fontSize: 13 }}>
              Unirme con codigo
            </button>
          </div>

          {/* Lista de ligas */}
          {leagues.length === 0 ? (
            <div className="empty-state">
              <div className="icon">👥</div>
              <p>Aun no te uniste a ninguna liga. Creá una o uníte con un codigo.</p>
            </div>
          ) : (
            leagues.map(league => (
              <div key={league.id} style={{
                background: 'var(--card-bg)', border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: 14, marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{league.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {league.ownerName} · {league.memberCount} miembros
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
                    padding: '4px 10px', borderRadius: 6,
                    background: 'var(--gold-bg)', color: 'var(--gold)',
                    border: '1px solid var(--gold)',
                  }}>
                    {league.code}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => viewLeaderboard(league.id)} style={{
                    flex: 1, padding: '9px', background: G, color: 'white',
                    border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    Ver tabla
                  </button>
                  {!league.isOwner && (
                    <button onClick={() => leave(league.id, league.name)} style={{
                      padding: '9px 14px', background: 'var(--card-bg)',
                      color: 'var(--danger)', border: `1px solid var(--danger)`,
                      borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Salir
                    </button>
                  )}
                  {league.isOwner && (
                    <button onClick={() => deleteLeague(league.id, league.name)} style={{
                      padding: '9px 14px', background: 'var(--danger-bg)',
                      color: 'var(--danger)', border: `1px solid var(--danger)`,
                      borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Modal Crear Liga */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 500,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-header">
              <div className="modal-title">Crear liga</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label>Nombre de la liga</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Ej: La banda del trabajo" />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Se generará un código de 6 caracteres para que tus amigos se unan.
            </p>
            <button className="btn btn-primary btn-full" onClick={create} disabled={busy}>
              {busy ? 'Creando...' : 'Crear liga'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Unirse con Código */}
      {showJoin && (
        <div onClick={() => setShowJoin(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 500,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-header">
              <div className="modal-title">Unirme a una liga</div>
              <button className="modal-close" onClick={() => setShowJoin(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label>Codigo de la liga</label>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123" maxLength={6} style={{ textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 18, textAlign: 'center', fontWeight: 700 }} />
            </div>
            <button className="btn btn-primary btn-full" onClick={join} disabled={busy}>
              {busy ? 'Uniendose...' : 'Unirme'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}