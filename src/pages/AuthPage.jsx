import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const [tab, setTab]       = useState('login')
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate            = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim()) { setError('Ingresá tu nombre.'); setLoading(false); return }
        await register(form.name, form.email, form.password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  const onKey = e => { if (e.key === 'Enter') submit() }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1B5E20' }}>
      {/* Hero */}
      <div style={{ padding: '56px 28px 32px' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🏆</div>
        <h1 style={{
          fontFamily: 'Georgia,serif', fontSize: 28, color: 'white',
          lineHeight: 1.15, marginBottom: 6
        }}>
          The Championships<br />Wimbledon 2026
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', letterSpacing: '.02em' }}>
          Pronósticos · Singles Masculino
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: '#FAFAF7', borderRadius: '24px 24px 0 0',
        padding: '28px 24px 48px', flex: 1,
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', border: '1px solid #E0E0D8',
          borderRadius: 8, overflow: 'hidden', marginBottom: 24,
        }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '11px', fontSize: 14, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: tab === t ? '#1B5E20' : 'white',
              color: tab === t ? 'white' : '#888',
            }}>
              {t === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error mb-12">{error}</div>
        )}

        {tab === 'register' && (
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={form.name}
              onChange={set('name')} onKeyDown={onKey} />
          </div>
        )}
        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" placeholder="tu@email.com" value={form.email}
            onChange={set('email')} onKeyDown={onKey} />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••" value={form.password}
            onChange={set('password')} onKeyDown={onKey} />
        </div>

        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
          {loading ? 'Procesando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>

        {tab === 'login' && (
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#888' }}>
            Demo admin: admin@wimbledon.com / admin1234
          </p>
        )}
      </div>
    </div>
  )
}
