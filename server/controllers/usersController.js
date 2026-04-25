import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'

const isProd = process.env.NODE_ENV === 'production'

const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' })

const setAuthCookie = (res, user) => {
  res.cookie('token', signToken(user), {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
  })
}

// POST /api/auth/register
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body
  if (!username?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  try {
    const password_hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username.trim(), email.trim().toLowerCase(), password_hash]
    )
    const user = result.rows[0]
    setAuthCookie(res, user)
    res.status(201).json({ user })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already taken.' })
    }
    res.status(500).json({ error: error.message })
  }
}

// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { username, password } = req.body
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
      [username.trim()]
    )
    const user = result.rows[0]
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password.' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' })
    }

    const { password_hash: _, ...safeUser } = user
    setAuthCookie(res, user)
    res.json({ user: safeUser })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users ORDER BY username ASC'
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createUser = async (req, res) => {
  const { username, email } = req.body
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required.' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email, created_at',
      [username.trim(), email.trim().toLowerCase()]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists.' })
    }
    res.status(500).json({ error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
