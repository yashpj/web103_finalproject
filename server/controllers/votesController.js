import { pool } from '../config/database.js'

// GET /api/groups/:groupId/votes — returns current user's votes for the group
export const getVotesByGroup = async (req, res) => {
  const { groupId } = req.params
  const userId = req.user.id

  try {
    const result = await pool.query(`
      SELECT v.*
      FROM votes v
      JOIN suggestions s ON v.suggestion_id = s.id
      WHERE s.group_id = $1 AND v.user_id = $2
    `, [groupId, userId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/votes — upsert (create or update) a vote
export const upsertVote = async (req, res) => {
  const { suggestion_id, rating } = req.body
  const userId = req.user.id

  if (!suggestion_id || !rating) {
    return res.status(400).json({ error: 'Suggestion ID and rating are required.' })
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' })
  }

  try {
    const result = await pool.query(`
      INSERT INTO votes (suggestion_id, user_id, rating, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (suggestion_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [suggestion_id, userId, rating])

    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/votes/:id
export const deleteVote = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const result = await pool.query(
      'DELETE FROM votes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vote not found or unauthorized.' })
    }
    res.json({ message: 'Vote removed successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
