import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGroupById, removeMember, deleteGroup, updateDeadline } from '../services/GroupsAPI'

const GroupSettings = ({ currentUser }) => {
  const { id: groupId } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineSaving, setDeadlineSaving] = useState(false)

  const loadGroup = async () => {
    try {
      const data = await getGroupById(groupId)
      setGroup(data)
    } catch (err) {
      setError('Failed to load group settings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGroup()
  }, [groupId])

  const handleRemoveMember = async (userId) => {
    setActionError(null)
    try {
      await removeMember(groupId, userId, currentUser.id)
      setGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== userId)
      }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Delete "${group.group_name}"? This cannot be undone.`)) return
    setActionError(null)
    try {
      await deleteGroup(groupId, currentUser.id)
      navigate('/dashboard')
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleDeadlineSave = async () => {
    setDeadlineSaving(true)
    setActionError(null)
    try {
      const updated = await updateDeadline(groupId, currentUser.id, deadlineInput || null)
      setGroup(prev => ({ ...prev, voting_deadline: updated.voting_deadline }))
      setDeadlineInput('')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeadlineSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-gray-400">Loading settings...</p>
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

  const isAdmin = group.admin_id === currentUser.id

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/groups/${groupId}`}
          className="text-gray-400 transition hover:text-white"
        >
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-white">Group Settings</h1>
      </div>

      {/* Group info */}
      <section className="mb-8 rounded-2xl bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Name</span>
            <span className="text-white">{group.group_name}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Invite Code</span>
            <span className="font-mono text-white">{group.invite_code}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Members</span>
            <span className="text-white">{group.members?.length ?? 0}</span>
          </div>
        </div>
      </section>

      {/* Members list */}
      <section className="mb-8 rounded-2xl bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Members</h2>

        {actionError && (
          <p className="mb-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300">
            {actionError}
          </p>
        )}

        <ul className="space-y-3">
          {group.members?.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
            >
              <div>
                <span className="font-medium text-white">{member.username}</span>
                {member.id === group.admin_id && (
                  <span className="ml-2 rounded-full bg-red-900/60 px-2 py-0.5 text-xs text-red-300">
                    Admin
                  </span>
                )}
                {member.id === currentUser.id && (
                  <span className="ml-2 text-xs text-gray-500">(you)</span>
                )}
              </div>
              {isAdmin && member.id !== currentUser.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-900/30 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Voting deadline */}
      {isAdmin && (
        <section className="mb-8 rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">Voting Deadline</h2>
          <p className="mb-4 text-sm text-gray-400">
            After this time, members can no longer cast or change votes.
          </p>

          {group.voting_deadline && (
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3">
              <span className="text-sm text-gray-300">
                Current: <span className="text-white">
                  {new Date(group.voting_deadline).toLocaleString()}
                </span>
              </span>
              <button
                onClick={() => handleDeadlineSave('')}
                disabled={deadlineSaving}
                className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-red-500 [color-scheme:dark]"
            />
            <button
              onClick={handleDeadlineSave}
              disabled={deadlineSaving || !deadlineInput}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {deadlineSaving ? 'Saving...' : 'Set'}
            </button>
          </div>
        </section>
      )}

      {/* Danger zone */}
      {isAdmin && (
        <section className="rounded-2xl border border-red-900/50 bg-gray-900 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-sm text-gray-400">
            Deleting this group will remove all suggestions and votes permanently.
          </p>
          <button
            onClick={handleDeleteGroup}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Delete Group
          </button>
        </section>
      )}
    </main>
  )
}

export default GroupSettings
