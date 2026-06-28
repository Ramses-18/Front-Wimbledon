import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// ── Axios instance ─────────────────────────────────────────────────────
export const api = axios.create({ baseURL: 'http://localhost:8081' })

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
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('wim_token')
    localStorage.removeItem('wim_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
