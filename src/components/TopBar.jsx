import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { api } from '../context/AuthContext.jsx'

export default function TopBar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifStatus, setNotifStatus] = useState(null)

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones.')
      return
    }

    if (Notification.permission === 'denied') {
      alert('Las notificaciones estan bloqueadas. Habilitalas desde la configuracion del navegador.')
      return
    }

    try {
      if (Notification.permission === 'granted') {
        // Desuscribir
        const reg = await navigator.serviceWorker?.getRegistration()
        const sub = await reg?.pushManager?.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await api.post('/notifications/unsubscribe', { endpoint: sub.endpoint })
        }
        setNotifStatus(false)
      } else {
        // Pedir permiso y suscribir
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          const reg = await navigator.serviceWorker?.getRegistration()
          if (reg) {
            const newSub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-GV3WVDRJxPO7NxKAzAKX_V3lmfFc6YcJrXI-E'),
            })
            await api.post('/notifications/subscribe', {
              endpoint: newSub.endpoint,
              p256dh: arrayBufferToBase64(newSub.getKey('p256dh')),
              authKey: arrayBufferToBase64(newSub.getKey('auth')),
            })
            setNotifStatus(true)
          }
        }
      }
    } catch (e) {
      console.warn('Error con notificaciones:', e)
    }
  }

  // Check initial notification status
  React.useEffect(() => {
    if ('Notification' in window) {
      setNotifStatus(Notification.permission === 'granted')
    }
  }, [])

  return (
    <div style={{
      background: 'var(--topbar-bg)', color: 'white', padding: '13px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700 }}>
          SW 19
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 1 }}>
          {user?.name}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={toggleNotifications}
          className="theme-toggle"
          aria-label={notifStatus ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          title={notifStatus ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          style={{ fontSize: 14, opacity: notifStatus ? 1 : 0.5 }}
        >
          {notifStatus ? '🔔' : '🔕'}
        </button>
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Cambiar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          style={{ fontSize: 16 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button onClick={logout} style={{
          background: 'rgba(255,255,255,.15)', border: 'none', color: 'white',
          fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 600,
        }}>
          Salir
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
