import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { registerUser, loginUser } from '../services/UsersAPI'

const OAUTH_ERRORS = {
  invalid_state: 'OAuth state mismatch. Please try again.',
  github_token_failed: 'GitHub login failed. Please try again.',
  server_error: 'A server error occurred. Please try again.'
}

const LandingPage = ({ onLogin }) => {
  const [tab, setTab] = useState('login')
  const [fields, setFields] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) setError(OAUTH_ERRORS[oauthError] ?? 'An error occurred during GitHub login.')
  }, [])

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

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <a
          href="/api/auth/github"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
          </svg>
          Continue with GitHub
        </a>
      </div>
    </div>
  )
}

export default LandingPage
