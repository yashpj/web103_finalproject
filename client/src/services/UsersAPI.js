import { BASE_URL, authFetch } from './api'

export const registerUser = async ({ username, email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Registration failed')
  }
  return res.json()
}

export const loginUser = async ({ username, password }) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Login failed')
  }
  return res.json()
}

export const logoutUser = async () => {
  await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
}

export const getAllUsers = async () => {
  const res = await authFetch(`${BASE_URL}/users`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getUserById = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/${userId}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const createUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create user')
  }
  return res.json()
}
