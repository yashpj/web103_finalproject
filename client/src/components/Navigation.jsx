import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navigation = ({ currentUser, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-white hover:text-red-400"
        >
          <span>🎬</span>
          <span>CinePhile</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-400 sm:block">
            {currentUser.username}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 transition hover:border-gray-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
