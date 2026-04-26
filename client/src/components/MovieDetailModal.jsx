import React, { useState, useEffect } from 'react'
import { getMovieDetails } from '../services/MoviesAPI'

const POSTER_LG = 'https://image.tmdb.org/t/p/w342'
const BACKDROP = 'https://image.tmdb.org/t/p/w780'
const PROFILE = 'https://image.tmdb.org/t/p/w92'

const MovieDetailModal = ({ suggestion, onClose }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!suggestion.tmdb_id) {
      setLoading(false)
      return
    }
    getMovieDetails(suggestion.tmdb_id)
      .then(setDetails)
      .catch(() => setError('Could not load movie details.'))
      .finally(() => setLoading(false))
  }, [suggestion.tmdb_id])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const runtimeLabel = (mins) => {
    if (!mins) return null
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const poster = details?.poster_path
    ? `${POSTER_LG}${details.poster_path}`
    : suggestion.poster_path
      ? `${POSTER_LG}${suggestion.poster_path}`
      : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 shadow-2xl">
        {/* Backdrop */}
        {details?.backdrop_path && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
            <img
              src={`${BACKDROP}${details.backdrop_path}`}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex gap-5 p-6 pt-4">
          {/* Poster */}
          {poster ? (
            <img
              src={poster}
              alt={suggestion.title}
              className="h-48 w-32 flex-shrink-0 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-48 w-32 flex-shrink-0 items-center justify-center rounded-xl bg-gray-800 text-4xl">
              🎞️
            </div>
          )}

          {/* Core info */}
          <div className="flex min-w-0 flex-col justify-center gap-2">
            <h2 className="text-xl font-bold text-white leading-tight">{suggestion.title}</h2>
            {details?.tagline && (
              <p className="text-sm italic text-gray-400">"{details.tagline}"</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              {details?.release_date && (
                <span>{new Date(details.release_date).getFullYear()}</span>
              )}
              {details?.runtime && (
                <span>· {runtimeLabel(details.runtime)}</span>
              )}
              {details?.status && details.status !== 'Released' && (
                <span className="rounded bg-yellow-700/40 px-1.5 py-0.5 text-yellow-300">
                  {details.status}
                </span>
              )}
            </div>
            {details?.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {details.genres.map(g => (
                  <span
                    key={g}
                    className="rounded-full bg-red-900/50 px-2.5 py-0.5 text-xs text-red-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {details?.vote_average > 0 && (
              <p className="text-sm text-yellow-400">
                ★ {details.vote_average.toFixed(1)}
                <span className="ml-1 text-xs text-gray-500">
                  TMDB ({details.vote_count?.toLocaleString()} ratings)
                </span>
              </p>
            )}
            {details?.director && (
              <p className="text-xs text-gray-400">
                Directed by <span className="text-white">{details.director}</span>
              </p>
            )}
          </div>
        </div>

        {/* Overview */}
        {(details?.overview || loading || error) && (
          <div className="px-6 pb-2">
            {loading && <p className="text-sm text-gray-500">Loading details…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!loading && !error && details?.overview && (
              <>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Overview</h3>
                <p className="text-sm leading-relaxed text-gray-300">{details.overview}</p>
              </>
            )}
            {!loading && !error && !suggestion.tmdb_id && (
              <p className="text-sm text-gray-500 italic">No additional details available for this entry.</p>
            )}
          </div>
        )}

        {/* Cast */}
        {details?.cast?.length > 0 && (
          <div className="px-6 pb-6 pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cast</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {details.cast.map(member => (
                <div key={member.name} className="flex w-16 flex-shrink-0 flex-col items-center text-center">
                  {member.profile_path ? (
                    <img
                      src={`${PROFILE}${member.profile_path}`}
                      alt={member.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-2xl">
                      👤
                    </div>
                  )}
                  <p className="mt-1 text-xs font-medium text-white leading-tight line-clamp-2">{member.name}</p>
                  <p className="text-xs text-gray-500 leading-tight line-clamp-2">{member.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetailModal
