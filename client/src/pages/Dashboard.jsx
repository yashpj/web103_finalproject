import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserGroups } from '../services/GroupsAPI'
import GroupModal from '../components/GroupModal'

const Dashboard = ({ currentUser }) => {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'join'

  const loadGroups = async () => {
    try {
      const data = await getUserGroups(currentUser.id)
      setGroups(data)
    } catch (err) {
      setError('Failed to load groups.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [currentUser.id])

  const openCreate = () => {
    setModalMode('create')
    setShowModal(true)
  }

  const openJoin = () => {
    setModalMode('join')
    setShowModal(true)
  }

  const handleGroupAction = () => {
    setShowModal(false)
    loadGroups()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-gray-400">Loading your groups...</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Groups</h1>
          <p className="mt-1 text-gray-400">Welcome back, {currentUser.username}!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openJoin}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-400 hover:text-white"
          >
            Join Group
          </button>
          <button
            onClick={openCreate}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            + Create Group
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-900/50 px-4 py-3 text-red-300">{error}</p>
      )}

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-700 p-16 text-center">
          <div className="text-4xl">🎞️</div>
          <p className="mt-4 text-lg text-gray-400">You haven&apos;t joined any groups yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Create a new group or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="group rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">🎬</span>
                {group.admin_id === currentUser.id && (
                  <span className="rounded-full bg-red-900/60 px-2 py-0.5 text-xs text-red-300">
                    Admin
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-red-400">
                {group.group_name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {group.member_count} member{group.member_count !== '1' ? 's' : ''}
              </p>
              <p className="mt-3 text-xs text-gray-600">
                Invite: <span className="font-mono text-gray-500">{group.invite_code}</span>
              </p>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <GroupModal
          mode={modalMode}
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onSuccess={handleGroupAction}
        />
      )}
    </main>
  )
}

export default Dashboard
