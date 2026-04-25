import { BASE_URL, authFetch } from './api'

export const getUserGroups = async () => {
  const res = await authFetch(`${BASE_URL}/users/me/groups`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getGroupById = async (groupId) => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const error = new Error(err.error || 'Failed to fetch group')
    error.status = res.status
    throw error
  }
  return res.json()
}

export const createGroup = async (groupData) => {
  const res = await authFetch(`${BASE_URL}/groups`, {
    method: 'POST',
    body: JSON.stringify(groupData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create group')
  }
  return res.json()
}

export const joinGroup = async (inviteCode) => {
  const res = await authFetch(`${BASE_URL}/groups/join`, {
    method: 'POST',
    body: JSON.stringify({ invite_code: inviteCode })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to join group')
  }
  return res.json()
}

export const removeMember = async (groupId, userId) => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/members/${userId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to remove member')
  }
  return res.json()
}

export const deleteGroup = async (groupId) => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete group')
  }
  return res.json()
}
