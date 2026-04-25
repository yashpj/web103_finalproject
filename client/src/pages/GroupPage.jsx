import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getGroupById } from '../services/GroupsAPI'
import { getSuggestions } from '../services/SuggestionsAPI'
import { getVotesByGroup, castVote } from '../services/VotesAPI'
import { calculateTop3 } from '../utilities/calculateTop3'
import Top3Leaderboard from '../components/Top3Leaderboard'
import VotingCard from '../components/VotingCard'
import SuggestionForm from '../components/SuggestionForm'

const GroupPage = ({ currentUser }) => {
  const { id: groupId } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [userVotes, setUserVotes] = useState({})  // { suggestion_id: vote }
  const [sort, setSort] = useState('recent')
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      const [groupData, suggestionsData, votesData] = await Promise.all([
        getGroupById(groupId),
        getSuggestions(groupId, sort),
        getVotesByGroup(groupId)
      ])
      setGroup(groupData)
      setSuggestions(suggestionsData)

      const votesMap = {}
      votesData.forEach(v => { votesMap[v.suggestion_id] = v })
      setUserVotes(votesMap)
    } catch (err) {
      if (err.status === 403) {
        navigate('/dashboard')
        return
      }
      setError('Failed to load group data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [groupId, sort])

  // Socket.io — real-time vote updates (stretch feature)
  useEffect(() => {
    const socket = io()
    socket.emit('join-group', groupId)

    socket.on('vote-updated', () => {
      // Refresh suggestions to get updated avg_rating counts
      getSuggestions(groupId, sort).then(setSuggestions).catch(() => {})
    })

    socket.on('suggestion-updated', () => {
      getSuggestions(groupId, sort).then(setSuggestions).catch(() => {})
    })

    return () => {
      socket.emit('leave-group', groupId)
      socket.disconnect()
    }
  }, [groupId, sort])

  const handleVote = async (suggestionId, rating, socket) => {
    try {
      const updatedVote = await castVote({ suggestion_id: suggestionId, rating })
      setUserVotes(prev => ({ ...prev, [suggestionId]: updatedVote }))

      // Optimistically update avg_rating in the suggestions list
      setSuggestions(prev =>
        prev.map(s => {
          if (s.id !== suggestionId) return s
          const prevVote = userVotes[suggestionId]
          const prevRating = prevVote ? parseFloat(prevVote.rating) : null
          const count = parseInt(s.vote_count)
          let newAvg

          if (prevRating !== null) {
            // Update existing vote
            const total = parseFloat(s.avg_rating) * count - prevRating + rating
            newAvg = (total / count).toFixed(2)
          } else {
            // New vote
            const total = (parseFloat(s.avg_rating) || 0) * count + rating
            newAvg = (total / (count + 1)).toFixed(2)
          }

          return {
            ...s,
            avg_rating: newAvg,
            vote_count: prevRating !== null ? count : count + 1
          }
        })
      )

      // Notify other clients
      const sock = io()
      sock.emit('vote-cast', { groupId, suggestionId, rating })
      sock.disconnect()
    } catch (err) {
      console.error('Failed to cast vote:', err.message)
    }
  }

  const handleSuggestionAdded = () => {
    setShowForm(false)
    loadData()
  }

  const handleSuggestionDeleted = () => {
    loadData()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-gray-400">Loading group...</p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-red-400">{error || 'Group not found.'}</p>
      </div>
    )
  }

  const top3 = calculateTop3(suggestions)
  const isAdmin = group.admin_id === currentUser.id

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{group.group_name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Invite code: <span className="font-mono text-gray-400">{group.invite_code}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              to={`/groups/${groupId}/settings`}
              className="rounded-lg border border-gray-600 px-3 py-1.5 text-sm text-gray-300 transition hover:border-gray-400 hover:text-white"
            >
              Settings
            </Link>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-500"
          >
            + Add Movie
          </button>
        </div>
      </div>

      {/* Top 3 Leaderboard */}
      {top3.length > 0 && <Top3Leaderboard top3={top3} />}

      {/* Sort controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSort('recent')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            sort === 'recent'
              ? 'bg-red-600 text-white'
              : 'border border-gray-600 text-gray-400 hover:border-gray-400'
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSort('rated')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            sort === 'rated'
              ? 'bg-red-600 text-white'
              : 'border border-gray-600 text-gray-400 hover:border-gray-400'
          }`}
        >
          Highest Rated
        </button>
      </div>

      {/* Suggestions list */}
      {suggestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-12 text-center">
          <p className="text-gray-400">No movies suggested yet.</p>
          <p className="mt-1 text-sm text-gray-500">Be the first to add one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <VotingCard
              key={suggestion.id}
              suggestion={suggestion}
              currentUser={currentUser}
              userVote={userVotes[suggestion.id] || null}
              onVote={(rating) => handleVote(suggestion.id, rating)}
              onDeleted={handleSuggestionDeleted}
              onUpdated={loadData}
            />
          ))}
        </div>
      )}

      {/* Add Movie modal */}
      {showForm && (
        <SuggestionForm
          groupId={groupId}
          currentUser={currentUser}
          existingTitles={suggestions.map(s => s.title)}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuggestionAdded}
        />
      )}
    </main>
  )
}

export default GroupPage
