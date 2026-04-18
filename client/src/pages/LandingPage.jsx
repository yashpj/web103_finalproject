import React, { useState } from 'react'
import { createUser, getAllUsers } from '../services/UsersAPI'

const LandingPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim()) {
      setError('Username and email are required.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try to create the user; if they already exist the API returns 409
      const user = await createUser({ username: username.trim(), email: email.trim() })
      onLogin(user)
    } catch (err) {
      if (err.message.includes('already exists')) {
        // User exists — fetch them by scanning users list
        try {
          const users = await getAllUsers()
          const existing = users.find(
            u => u.username.toLowerCase() === username.trim().toLowerCase()
          )
          if (existing) {
            onLogin(existing)
          } else {
            setError('Email already in use by a different username.')
          }
        } catch {
          setError('Could not connect to the server. Is it running?')
        }
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="mb-8 text-center">
        <div className="text-6xl">🎬</div>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">
          CinePhile
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          End the debate. Pick the perfect movie together.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-gray-900 p-8 shadow-xl"
      >
        <h2 className="mb-6 text-xl font-semibold text-white">Get Started</h2>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-400" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alice"
            className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-gray-400" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alice@example.com"
            className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Enter CinePhile'}
        </button>
      </form>
    </div>
  )
}

export default LandingPage
