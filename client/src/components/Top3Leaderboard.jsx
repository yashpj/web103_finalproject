import React, { useState } from 'react'
import MovieDetailModal from './MovieDetailModal'

const MEDALS = ['🥇', '🥈', '🥉']

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

const Top3Leaderboard = ({ top3 }) => {
  const [selected, setSelected] = useState(null)

  return (
    <section className="mb-8 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <h2 className="mb-4 text-lg font-semibold text-yellow-400">
        Winner&apos;s Circle
      </h2>
      <div className="flex flex-wrap gap-4">
        {top3.map((movie, index) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => setSelected(movie)}
            className="flex flex-1 min-w-[160px] items-center gap-3 rounded-xl bg-gray-950/60 p-4 text-left transition hover:bg-gray-950/90 focus:outline-none"
          >
            {movie.poster_path ? (
              <img
                src={`${TMDB_IMG}${movie.poster_path}`}
                alt={movie.title}
                className="h-16 w-12 rounded object-cover"
              />
            ) : (
              <div className="flex h-16 w-12 items-center justify-center rounded bg-gray-700 text-2xl">
                🎞️
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xl">{MEDALS[index]}</div>
              <p className="mt-0.5 truncate font-medium text-white">{movie.title}</p>
              <p className="text-sm text-yellow-400">
                ★ {parseFloat(movie.avg_rating).toFixed(1)}
                <span className="ml-1 text-xs text-gray-500">
                  ({movie.vote_count} vote{movie.vote_count !== '1' ? 's' : ''})
                </span>
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <MovieDetailModal suggestion={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}

export default Top3Leaderboard
