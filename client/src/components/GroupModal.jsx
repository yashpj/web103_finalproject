import React, { useState } from 'react'
import { createGroup, joinGroup } from '../services/GroupsAPI'
import { validateGroupName } from '../utilities/validation'

const GroupModal = ({ mode, currentUser, onClose, onSuccess }) => {
  const isCreate = mode === 'create'

  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (isCreate) {
      const validation = validateGroupName(groupName)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
    } else if (!inviteCode.trim()) {
      setError('Invite code is required.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isCreate) {
        await createGroup({
          group_name: groupName.trim(),
          admin_id: currentUser.id,
          voting_deadline: deadline || null
        })
      } else {
        await joinGroup(currentUser.id, inviteCode.trim())
      }
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
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isCreate ? 'Create a Group' : 'Join a Group'}
          </h2>
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

          {isCreate ? (
            <>
              <div>
                <label className="mb-1 block text-sm text-gray-400" htmlFor="groupName">
                  Group Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Friday Night Flicks"
                  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400" htmlFor="deadline">
                  Voting Deadline <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-red-500 [color-scheme:dark]"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-sm text-gray-400" htmlFor="inviteCode">
                Invite Code <span className="text-red-400">*</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. FNF001"
                className="w-full rounded-lg bg-gray-800 px-4 py-2 font-mono text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
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
              disabled={isSubmitting}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting
                ? isCreate ? 'Creating...' : 'Joining...'
                : isCreate ? 'Create' : 'Join'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GroupModal
