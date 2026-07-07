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

  const inputStyle = {
    width: '100%', padding: '14px 0', border: 'none',
    borderBottom: '2px solid #1B5E20', fontSize: 14,
    background: 'transparent', color: '#fff', outline: 'none',
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: '#666', display: 'block',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em',
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', background: '#0a1a0f',
    }}>
      {/* Grass gradient overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(180deg, rgba(10,26,15,.95) 0%, rgba(27,94,32,.3) 70%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
        background: 'linear-gradient(180deg, rgba(27,94,32,.15) 0%, transparent 50%)',
      }} />

      {/* Hero */}
      <div style={{ position: 'relative', padding: '72px 32px 40px', textAlign: 'center' }}>
        <p style={{
          fontSize: 11, letterSpacing: '.3em', color: 'rgba(255,255,255,.3)',
          textTransform: 'uppercase', marginBottom: 16,
        }}>The Championships</p>
        <h1 style={{
          fontFamily: 'Georgia,serif', fontSize: 64, color: '#fff',
          fontWeight: 300, letterSpacing: '.04em', lineHeight: 1,
        }}>SW 19</h1>
        <div style={{ width: 40, height: 2, background: '#4CAF50', margin: '20px auto' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Wimbledon 2026 · Pronósticos</p>
      </div>

      {/* Form card */}
      <div style={{
        position: 'relative', flex: 1, margin: '0 20px',
        background: 'rgba(255,255,255,.97)', borderRadius: 20,
        padding: '32px 24px 48px', boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', border: '1px solid #E8E4DC', borderRadius: 8,
          overflow: 'hidden', marginBottom: 28,
        }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: 11, fontSize: 13, fontWeight: tab === t ? 600 : 500,
              textAlign: 'center', border: 'none', cursor: 'pointer',
              background: tab === t ? '#1B5E20' : 'transparent',
              color: tab === t ? '#fff' : '#999',
            }}>
              {t === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {tab === 'register' && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={form.name}
              onChange={set('name')} onKeyDown={onKey} style={inputStyle} />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="tu@email.com" value={form.email}
            onChange={set('email')} onKeyDown={onKey} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Contraseña</label>
          <input type="password" placeholder="••••••••" value={form.password}
            onChange={set('password')} onKeyDown={onKey} style={inputStyle} />
        </div>

        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: 16, border: 'none', borderRadius: 12,
          background: '#1B5E20', color: '#fff', fontSize: 15,
          fontWeight: 700, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? 'Procesando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>

        {tab === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 16 }}>
            Bienvenido a Wimbledon 2026
          </p>
        )}
      </div>
    </div>
  )
}