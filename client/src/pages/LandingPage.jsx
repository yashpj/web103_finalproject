import React, { useState } from 'react'
import { registerUser, loginUser } from '../services/UsersAPI'

const LandingPage = ({ onLogin }) => {
  const [tab, setTab] = useState('login')
  const [fields, setFields] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (tab === 'register') {
      if (!fields.username.trim() || !fields.email.trim() || !fields.password) {
        return setError('All fields are required.')
      }
      if (fields.password.length < 6) {
        return setError('Password must be at least 6 characters.')
      }
      if (fields.password !== fields.confirm) {
        return setError('Passwords do not match.')
      }
    } else {
      if (!fields.username.trim() || !fields.password) {
        return setError('Username and password are required.')
      }
    }

    setIsLoading(true)
    try {
      const fn = tab === 'register' ? registerUser : loginUser
      const { user } = await fn(fields)
      onLogin(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (next) => {
    setTab(next)
    setError(null)
    setFields({ username: '', email: '', password: '', confirm: '' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="mb-8 text-center">
        <div className="text-6xl">🎬</div>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">CinePhile</h1>
        <p className="mt-3 text-lg text-gray-400">End the debate. Pick the perfect movie together.</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-8 shadow-xl">
        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-800 p-1">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                tab === t ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Username</label>
            <input
              type="text"
              value={fields.username}
              onChange={set('username')}
              placeholder="e.g. alice"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="mb-1 block text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={fields.email}
                onChange={set('email')}
                placeholder="e.g. alice@example.com"
                className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={fields.password}
              onChange={set('password')}
              placeholder="••••••••"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="mb-1 block text-sm text-gray-400">Confirm Password</label>
              <input
                type="password"
                value={fields.confirm}
                onChange={set('confirm')}
                placeholder="••••••••"
                className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading
              ? tab === 'login' ? 'Signing in...' : 'Creating account...'
              : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LandingPage
