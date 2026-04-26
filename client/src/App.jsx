import React, { useState, useEffect } from 'react'
import { useRoutes, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import GroupPage from './pages/GroupPage'
import GroupSettings from './pages/GroupSettings'
import { logoutUser } from './services/UsersAPI'
import './App.css'

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cinephile_user')
    return saved ? JSON.parse(saved) : null
  })
  const [authChecked, setAuthChecked] = useState(() => !!localStorage.getItem('cinephile_user'))

  useEffect(() => {
    if (authChecked) return
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          localStorage.setItem('cinephile_user', JSON.stringify(data.user))
          setCurrentUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  const handleLogin = (user) => {
    localStorage.setItem('cinephile_user', JSON.stringify(user))
    setCurrentUser(user)
  }

  const handleLogout = async () => {
    await logoutUser()
    localStorage.removeItem('cinephile_user')
    setCurrentUser(null)
  }

  const element = useRoutes([
    {
      path: '/',
      element: currentUser
        ? <Navigate to="/dashboard" replace />
        : <LandingPage onLogin={handleLogin} />
    },
    {
      path: '/dashboard',
      element: currentUser
        ? <Dashboard currentUser={currentUser} />
        : <Navigate to="/" replace />
    },
    {
      path: '/groups/:id',
      element: currentUser
        ? <GroupPage currentUser={currentUser} />
        : <Navigate to="/" replace />
    },
    {
      path: '/groups/:id/settings',
      element: currentUser
        ? <GroupSettings currentUser={currentUser} />
        : <Navigate to="/" replace />
    }
  ])

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {currentUser && (
        <Navigation currentUser={currentUser} onLogout={handleLogout} />
      )}
      {element}
    </div>
  )
}

export default App
