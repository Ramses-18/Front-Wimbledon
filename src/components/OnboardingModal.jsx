import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    icon: '🎾',
    title: 'Bienvenido a Wimbledon 2026',
    desc: 'Hacé tus pronósticos de cada partido del torneo de Singles Masculino y sumá puntos para subir en la tabla.',
  },
  {
    icon: '🏆',
    title: 'Puntos por acierto',
    desc: 'Ganador correcto: +1 punto. Sets correctos: +3 puntos. Resultado exacto set a set: +10 puntos. Usá tu corrección diaria si te equivocaste.',
  },
  {
    icon: '👥',
    title: 'Competí en ligas',
    desc: 'Creá o uníte a una liga privada con amigos usando un código. Compará sus pronósticos en una tabla exclusiva.',
  },
  {
    icon: '🔔',
    title: 'No te pierdas nada',
    desc: 'Activá las notificaciones push para saber cuándo empieza un partido de tu pick y cuando se cargan resultados.',
  },
]

export default function OnboardingModal({ onClose, onComplete }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  // Guardar que ya se vio el onboarding
  useEffect(() => {
    localStorage.setItem('wim_onboarding_seen', 'true')
  }, [])

  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete?.()
      onClose()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleEnableNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const reg = await navigator.serviceWorker?.getRegistration()
        if (reg) {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            // VAPID public key se configurará en producción
            applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-GV3WVDRJxPO7NxKAzAKX_V3lmfFc6YcJrXI-E',
          })
          const { api } = await import('../context/AuthContext.jsx')
          await api.post('/notifications/subscribe', {
            endpoint: sub.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
            authKey: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
          })
        }
      } catch (e) {
        console.warn('No se pudo suscribir a notificaciones:', e)
      }
    }
    handleNext()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--overlay-bg)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card-bg)', borderRadius: 24, padding: '32px 24px 24px',
        width: '100%', maxWidth: 380, margin: '0 16px', textAlign: 'center',
      }}>
        {/* Dots indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: step === i ? 20 : 6, height: 6,
              borderRadius: 3,
              background: step === i ? 'var(--green)' : 'var(--border)',
              transition: 'all .2s ease',
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 48, marginBottom: 16 }}>{current.icon}</div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700,
          marginBottom: 10, color: 'var(--text)',
        }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 14, lineHeight: 1.6, color: 'var(--text-mid)',
          marginBottom: 28, minHeight: 60,
        }}>
          {current.desc}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {step === 3 ? (
            <button onClick={handleEnableNotifications} style={{
              width: '100%', padding: '14px', background: 'var(--green)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              Activar notificaciones
            </button>
          ) : (
            <button onClick={handleNext} style={{
              width: '100%', padding: '14px', background: 'var(--green)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              {isLast ? 'Empezar' : 'Siguiente'}
            </button>
          )}

          {step > 0 && step < 3 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px',
            }}>
              Anterior
            </button>
          )}

          {step === 3 && (
            <button onClick={handleNext} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '8px',
            }}>
              Ahora no
            </button>
          )}
        </div>
      </div>
    </div>
  )
}