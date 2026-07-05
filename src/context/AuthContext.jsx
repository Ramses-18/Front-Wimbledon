import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('wim_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wim_token')
      localStorage.removeItem('wim_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Provider ───────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wim_user')) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('wim_token', data.token)
    localStorage.setItem('wim_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('wim_token', data.token)
    localStorage.setItem('wim_user', JSON.stringify(data))
    setUser(data)
    // Nuevo usuario: marcar que debe ver el onboarding
    localStorage.removeItem('wim_onboarding_seen')
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wim_token')
    localStorage.removeItem('wim_user')
    setUser(null)
  }, [])

  const subscribePush = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (sub) return // Ya suscrito
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-GV3WVDRJxPO7NxKAzAKX_V3lmfFc6YcJrXI-E'),
      })
      await api.post('/notifications/subscribe', {
        endpoint: newSub.endpoint,
        p256dh: arrayBufferToBase64(newSub.getKey('p256dh')),
        authKey: arrayBufferToBase64(newSub.getKey('auth')),
      })
    } catch (e) {
      console.warn('[subscribePush] error:', e)
    }
  }, [])

  // Suscribir a notificaciones push si el usuario lo permite
  const setupNotifications = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return

    try {
      if (Notification.permission === 'granted') {
        await subscribePush()
      } else if (Notification.permission === 'default') {
        // No pedir permiso automáticamente, se hace en el onboarding
      }
    } catch (e) {
      console.warn('[setupNotifications] no se pudo suscribir:', e)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setupNotifications }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ── Helpers ─────────────────────────────────────────────────────────────
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

