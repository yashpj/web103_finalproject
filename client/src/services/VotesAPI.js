import { BASE_URL, authFetch } from './api'

export const getVotesByGroup = async (groupId) => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/votes`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const castVote = async (voteData) => {
  const res = await authFetch(`${BASE_URL}/votes`, {
    method: 'POST',
    body: JSON.stringify(voteData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to cast vote')
  }
  return res.json()
}

export const removeVote = async (voteId) => {
  const res = await authFetch(`${BASE_URL}/votes/${voteId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to remove vote')
  }
  return res.json()
}
