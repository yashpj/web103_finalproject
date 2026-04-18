const BASE_URL = '/api'

export const getSuggestions = async (groupId, sort = 'recent') => {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/suggestions?sort=${sort}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const createSuggestion = async (groupId, data) => {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to add suggestion')
  }
  return res.json()
}

export const updateSuggestion = async (suggestionId, data) => {
  const res = await fetch(`${BASE_URL}/suggestions/${suggestionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update suggestion')
  }
  return res.json()
}

export const deleteSuggestion = async (suggestionId, userId) => {
  const res = await fetch(`${BASE_URL}/suggestions/${suggestionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete suggestion')
  }
  return res.json()
}
