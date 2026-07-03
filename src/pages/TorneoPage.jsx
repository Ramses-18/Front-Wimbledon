import React, { useEffect, useState } from 'react'
import { api } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const PLAYERS = [
  'Jannik Sinner','Carlos Alcaraz','Novak Djokovic','Alexander Zverev',
  'Daniil Medvedev','Andrey Rublev','Casper Ruud','Holger Rune',
  'Hubert Hurkacz','Taylor Fritz','Tommy Paul','Ben Shelton',
  'Frances Tiafoe','Ugo Humbert','Grigor Dimitrov','Alex de Minaur',
  'Sebastian Korda','Lorenzo Musetti','Nicolas Jarry','Arthur Fils',
]

const G = 'var(--green)'
const P = 'var(--purple)'

function PlayerSelect({ label, value, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, marginBottom: 4 }}>
        {label}
      </label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ background: value ? '#EDE7F6' : 'white', borderColor: value ? P : 'var(--border)',
          color: value ? P : 'var(--text-muted)', fontWeight: value ? 700 : 400 }}>
        <option value="">— Elegir jugador —</option>
        {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  )
}

export default function TorneoPage() {
  const { show } = useToast()
  const [pick, setPick] = useState({ champion: '', semis: ['','','',''] })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([api.get('/tournament/my-pick'), api.get('/tournament/result')])
      .then(([p, r]) => {
        setPick(p.data)
        setResult(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const setChampion = v => setPick(p => ({ ...p, champion: v }))
  const setSemi = i => v => setPick(p => {
    const semis = [...p.semis]; semis[i] = v; return { ...p, semis }
  })

  const save = async () => {
    setSaving(true)
    try {
      await api.post('/tournament/my-pick', pick)
      show('Pronóstico de torneo guardado ✓')
    } catch (e) {
      show(e.response?.data?.error || 'Error al guardar.', 'error')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding: 16 }}><div className="spinner" /></div>

  const isReal = result?.champion

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 4 }}>Pronósticos de torneo</h2>
      <p className="text-muted mb-12">Podés modificar hasta el inicio del torneo</p>

      {/* Champion card */}
      <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: P, padding: '12px 16px' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: 'white' }}>
            🏆 Campeón del torneo
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
            15 puntos si acertás
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <PlayerSelect label="Tu pick de campeón" value={pick.champion} onChange={setChampion} />
          {isReal && (
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--green-light)',
              borderRadius: 8, fontSize: 13, fontWeight: 700, color: G }}>
              Campeón real: {result.champion}
              {result.champion === pick.champion && ' ✓ ¡Acertaste! +15 pts'}
            </div>
          )}
        </div>
      </div>

      {/* Semis card */}
      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: P, padding: '12px 16px' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: 'white' }}>
            🎾 Semifinalistas
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>
            10 puntos por cada acierto
          </div>
        </div>
        <div style={{ padding: 14 }}>
          {[0,1,2,3].map(i => (
            <PlayerSelect key={i}
              label={`Semifinalista ${i+1}`}
              value={pick.semis?.[i] || ''}
              onChange={setSemi(i)}
            />
          ))}
          {isReal && result.semis?.filter(Boolean).length > 0 && (
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--green-light)',
              borderRadius: 8, fontSize: 12, color: G }}>
              Semifinalistas reales: {result.semis?.filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar pronóstico de torneo'}
      </button>
    </div>
  )
}
