import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import AuthPage   from './pages/AuthPage.jsx'
import TodayPage  from './pages/TodayPage.jsx'
import TablaPage  from './pages/TablaPage.jsx'
import TorneoPage from './pages/TorneoPage.jsx'
import AdminPage  from './pages/AdminPage.jsx'
import BottomNav  from './components/BottomNav.jsx'
import TopBar     from './components/TopBar.jsx'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppShell() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <main style={{ flex: 1, paddingBottom: 72 }}>
        <Routes>
          <Route path="/"       element={<TodayPage />} />
          <Route path="/tabla"  element={<TablaPage />} />
          <Route path="/torneo" element={<TorneoPage />} />
          {user.role === 'ADMIN' && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/*" element={
            <PrivateRoute><AppShell /></PrivateRoute>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
