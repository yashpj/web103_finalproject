const BASE_URL = '/api'

export const getUserGroups = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}/groups`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getGroupById = async (groupId) => {
  const res = await fetch(`${BASE_URL}/groups/${groupId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const createGroup = async (groupData) => {
  const res = await fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(groupData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create group')
  }
  return res.json()
}

export const joinGroup = async (userId, inviteCode) => {
  const res = await fetch(`${BASE_URL}/groups/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, invite_code: inviteCode })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to join group')
  }
  return res.json()
}

export const removeMember = async (groupId, userId, adminId) => {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_id: adminId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to remove member')
  }
  return res.json()
}

export const deleteGroup = async (groupId, adminId) => {
  const res = await fetch(`${BASE_URL}/groups/${groupId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_id: adminId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete group')
  }
  return res.json()
}
