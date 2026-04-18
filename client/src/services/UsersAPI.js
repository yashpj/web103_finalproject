const BASE_URL = '/api'

export const getAllUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getUserById = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const createUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create user')
  }
  return res.json()
}
