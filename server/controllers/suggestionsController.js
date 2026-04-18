import { pool } from '../config/database.js'

// GET /api/groups/:groupId/suggestions?sort=recent|rated
export const getSuggestionsByGroup = async (req, res) => {
  const { groupId } = req.params
  const { sort } = req.query

  const orderBy = sort === 'rated'
    ? 'avg_rating DESC NULLS LAST, s.created_at DESC'
    : 's.created_at DESC'

  try {
    const result = await pool.query(`
      SELECT
        s.id, s.group_id, s.user_id, s.tmdb_id, s.title, s.poster_path, s.created_at,
        u.username AS suggested_by,
        COUNT(v.id) AS vote_count,
        ROUND(AVG(v.rating)::NUMERIC, 2) AS avg_rating
      FROM suggestions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN votes v ON s.id = v.suggestion_id
      WHERE s.group_id = $1
      GROUP BY s.id, s.group_id, s.user_id, s.tmdb_id, s.title, s.poster_path, s.created_at, u.username
      ORDER BY ${orderBy}
    `, [groupId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/groups/:groupId/suggestions
export const createSuggestion = async (req, res) => {
  const { groupId } = req.params
  const { user_id, title, tmdb_id, poster_path } = req.body

  if (!user_id || !title || !title.trim()) {
    return res.status(400).json({ error: 'User ID and movie title are required.' })
  }

  try {
    const duplicate = await pool.query(
      'SELECT id FROM suggestions WHERE group_id = $1 AND LOWER(title) = LOWER($2)',
      [groupId, title.trim()]
    )
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'This movie has already been suggested in this group.' })
    }

    const result = await pool.query(
      `INSERT INTO suggestions (group_id, user_id, title, tmdb_id, poster_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [groupId, user_id, title.trim(), tmdb_id || null, poster_path || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/suggestions/:id
export const updateSuggestion = async (req, res) => {
  const { id } = req.params
  const { user_id, title, poster_path } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Movie title is required.' })
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM suggestions WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' })
    }
    if (existing.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({ error: 'You can only edit your own suggestions.' })
    }

    const result = await pool.query(
      'UPDATE suggestions SET title = $1, poster_path = $2 WHERE id = $3 RETURNING *',
      [title.trim(), poster_path || null, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/suggestions/:id
export const deleteSuggestion = async (req, res) => {
  const { id } = req.params
  const { user_id } = req.body

  try {
    const existing = await pool.query(
      'SELECT user_id FROM suggestions WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' })
    }
    if (existing.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({ error: 'You can only delete your own suggestions.' })
    }

    await pool.query('DELETE FROM suggestions WHERE id = $1', [id])
    res.json({ message: 'Suggestion deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
