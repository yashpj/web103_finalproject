import React, { useState, useEffect, useRef } from 'react'
import { createSuggestion } from '../services/SuggestionsAPI'
import { searchMovies } from '../services/MoviesAPI'
import { validateSuggestion } from '../utilities/validation'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

const SuggestionForm = ({ groupId, currentUser, existingTitles, onClose, onSuccess }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)   // { id, title, poster_path }
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceRef = useRef(null)

  // Debounced TMDB search — fires 400ms after the user stops typing
  useEffect(() => {
    if (selected) return          // already picked, don't re-search
    if (!query.trim()) { setResults([]); return }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchMovies(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query, selected])

  const handleSelect = (movie) => {
    setSelected(movie)
    setQuery(movie.title)
    setResults([])
    setError(null)
  }

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    if (selected) setSelected(null)   // clear selection when user edits
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const title = selected ? selected.title : query.trim()
    const validation = validateSuggestion(title, existingTitles)
    if (!validation.valid) { setError(validation.error); return }

    setIsSubmitting(true)
    setError(null)
    try {
      await createSuggestion(groupId, {
        user_id: currentUser.id,
        title,
        tmdb_id: selected?.id ?? null,
        poster_path: selected?.poster_path ?? null
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
          <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">{error}</p>
          )}

          <div className="relative">
            <label className="mb-1 block text-sm text-gray-400" htmlFor="movieSearch">
              Search Movie <span className="text-red-400">*</span>
            </label>
            <input
              id="movieSearch"
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Type a movie title…"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
              autoComplete="off"
            />

            {/* Dropdown results */}
            {results.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
                {results.map((movie) => (
                  <li key={movie.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(movie)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-gray-700"
                    >
                      {movie.poster_path
                        ? <img src={`${TMDB_IMG}${movie.poster_path}`} alt="" className="h-10 w-7 flex-shrink-0 rounded object-cover" />
                        : <div className="flex h-10 w-7 flex-shrink-0 items-center justify-center rounded bg-gray-700 text-sm">🎞️</div>
                      }
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{movie.title}</p>
                        {movie.release_date && (
                          <p className="text-xs text-gray-400">{movie.release_date.slice(0, 4)}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {isSearching && (
              <p className="mt-1 text-xs text-gray-500">Searching…</p>
            )}
          </div>

          {/* Selected movie preview */}
          {selected && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2">
              {selected.poster_path
                ? <img src={`${TMDB_IMG}${selected.poster_path}`} alt="" className="h-12 w-8 flex-shrink-0 rounded object-cover" />
                : <div className="flex h-12 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-700 text-sm">🎞️</div>
              }
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{selected.title}</p>
                <p className="text-xs text-green-400">Selected from TMDB</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelected(null); setQuery('') }}
                className="text-xs text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

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
              disabled={isSubmitting || !query.trim()}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding…' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SuggestionForm
