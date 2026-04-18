import React, { useState } from 'react'
import { deleteSuggestion, updateSuggestion } from '../services/SuggestionsAPI'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-xl transition"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <span className={star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

const VotingCard = ({ suggestion, currentUser, userVote, onVote, onDeleted, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(suggestion.title)
  const [editPoster, setEditPoster] = useState(suggestion.poster_path || '')
  const [editError, setEditError] = useState(null)

  const isOwner = suggestion.user_id === currentUser.id
  const currentRating = userVote ? parseInt(userVote.rating) : 0

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${suggestion.title}"?`)) return
    try {
      await deleteSuggestion(suggestion.id, currentUser.id)
      onDeleted()
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setEditError('Title is required.')
      return
    }
    try {
      await updateSuggestion(suggestion.id, {
        user_id: currentUser.id,
        title: editTitle.trim(),
        poster_path: editPoster.trim() || null
      })
      setIsEditing(false)
      setEditError(null)
      onUpdated()
    } catch (err) {
      setEditError(err.message)
    }
  }

  return (
    <div className="flex gap-4 rounded-2xl bg-gray-900 p-4">
      {/* Poster */}
      {suggestion.poster_path ? (
        <img
          src={`${TMDB_IMG}${suggestion.poster_path}`}
          alt={suggestion.title}
          className="h-20 w-14 flex-shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded bg-gray-800 text-2xl">
          🎞️
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded bg-gray-800 px-3 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Movie title"
            />
            <input
              value={editPoster}
              onChange={(e) => setEditPoster(e.target.value)}
              className="w-full rounded bg-gray-800 px-3 py-1 text-xs text-gray-400 outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Poster path (optional)"
            />
            {editError && <p className="text-xs text-red-400">{editError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="rounded px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-500"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditError(null) }}
                className="rounded px-3 py-1 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-medium text-white truncate">{suggestion.title}</h3>
              <p className="text-xs text-gray-500">
                Suggested by {suggestion.suggested_by}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={currentRating} onChange={onVote} />
              {parseFloat(suggestion.avg_rating) > 0 && (
                <span className="text-sm text-yellow-400">
                  ★ {parseFloat(suggestion.avg_rating).toFixed(1)}
                  <span className="ml-1 text-xs text-gray-500">
                    ({suggestion.vote_count})
                  </span>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && !isEditing && (
        <div className="flex flex-col justify-start gap-1 ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded p-1 text-xs text-gray-500 hover:text-gray-300"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-xs text-gray-500 hover:text-red-400"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default VotingCard
