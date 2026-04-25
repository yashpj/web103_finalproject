import { BASE_URL, authFetch } from './api'

export const getSuggestions = async (groupId, sort = 'recent') => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/suggestions?sort=${sort}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const createSuggestion = async (groupId, data) => {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/suggestions`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to add suggestion')
  }
  return res.json()
}

export const updateSuggestion = async (suggestionId, data) => {
  const res = await authFetch(`${BASE_URL}/suggestions/${suggestionId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update suggestion')
  }
  return res.json()
}

export const deleteSuggestion = async (suggestionId) => {
  const res = await authFetch(`${BASE_URL}/suggestions/${suggestionId}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to delete suggestion')
  }
  return res.json()
}
