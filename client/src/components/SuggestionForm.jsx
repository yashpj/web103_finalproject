import React, { useState } from 'react'
import { createSuggestion } from '../services/SuggestionsAPI'
import { validateSuggestion } from '../utilities/validation'

const SuggestionForm = ({ groupId, currentUser, existingTitles, onClose, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [tmdbId, setTmdbId] = useState('')
  const [posterPath, setPosterPath] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateSuggestion(title, existingTitles)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createSuggestion(groupId, {
        user_id: currentUser.id,
        title: title.trim(),
        tmdb_id: tmdbId ? parseInt(tmdbId) : null,
        poster_path: posterPath.trim() || null
      })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add a Movie</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm text-gray-400" htmlFor="title">
              Movie Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Dark Knight"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400" htmlFor="tmdbId">
              TMDB ID <span className="text-gray-600">(optional)</span>
            </label>
            <input
              id="tmdbId"
              type="number"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="e.g. 155"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400" htmlFor="posterPath">
              Poster Path <span className="text-gray-600">(optional)</span>
            </label>
            <input
              id="posterPath"
              type="text"
              value={posterPath}
              onChange={(e) => setPosterPath(e.target.value)}
              placeholder="e.g. /qJ2tW6WMUDux911r6m7haRef0WH.jpg"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-400 transition hover:border-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SuggestionForm
