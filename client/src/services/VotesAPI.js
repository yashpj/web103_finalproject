const BASE_URL = '/api'

export const getVotesByGroup = async (groupId, userId = null) => {
  const url = userId
    ? `${BASE_URL}/groups/${groupId}/votes?user_id=${userId}`
    : `${BASE_URL}/groups/${groupId}/votes`
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const castVote = async (voteData) => {
  const res = await fetch(`${BASE_URL}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voteData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to cast vote')
  }
  return res.json()
}

export const removeVote = async (voteId, userId) => {
  const res = await fetch(`${BASE_URL}/votes/${voteId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to remove vote')
  }
  return res.json()
}
