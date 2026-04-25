import { pool } from '../config/database.js'

// GET /api/users/:userId/groups — all groups a user belongs to
export const getUserGroups = async (req, res) => {
  const { userId } = req.params
  try {
    const result = await pool.query(`
      SELECT
        g.id, g.group_name, g.admin_id, g.invite_code,
        COUNT(DISTINCT m.user_id) AS member_count
      FROM groups g
      JOIN memberships m ON g.id = m.group_id
      WHERE g.id IN (
        SELECT group_id FROM memberships WHERE user_id = $1
      )
      GROUP BY g.id, g.group_name, g.admin_id, g.invite_code
      ORDER BY g.group_name ASC
    `, [userId])
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/groups/:id — single group with its members
export const getGroupById = async (req, res) => {
  const { id } = req.params
  try {
    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE id = $1',
      [id]
    )
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    const membersResult = await pool.query(`
      SELECT u.id, u.username, u.email, m.joined_at
      FROM users u
      JOIN memberships m ON u.id = m.user_id
      WHERE m.group_id = $1
      ORDER BY m.joined_at ASC
    `, [id])

    const voterResult = await pool.query(`
      SELECT COUNT(DISTINCT v.user_id) AS voters_count
      FROM votes v
      JOIN suggestions s ON v.suggestion_id = s.id
      WHERE s.group_id = $1
    `, [id])

    res.json({
      ...groupResult.rows[0],
      members: membersResult.rows,
      voters_count: parseInt(voterResult.rows[0].voters_count)
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/groups — create a new group, auto-enroll the admin
export const createGroup = async (req, res) => {
  const { group_name, admin_id, voting_deadline } = req.body
  if (!group_name || !admin_id) {
    return res.status(400).json({ error: 'Group name and admin ID are required.' })
  }

  const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const groupResult = await client.query(
      'INSERT INTO groups (group_name, admin_id, invite_code, voting_deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [group_name.trim(), admin_id, invite_code, voting_deadline || null]
    )
    const newGroup = groupResult.rows[0]

    await client.query(
      'INSERT INTO memberships (user_id, group_id) VALUES ($1, $2)',
      [admin_id, newGroup.id]
    )

    await client.query('COMMIT')
    res.status(201).json(newGroup)
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
}

// POST /api/groups/join — join a group by invite code
export const joinGroup = async (req, res) => {
  const { user_id, invite_code } = req.body
  if (!user_id || !invite_code) {
    return res.status(400).json({ error: 'User ID and invite code are required.' })
  }

  try {
    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE invite_code = $1',
      [invite_code.trim().toUpperCase()]
    )
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code.' })
    }

    const group = groupResult.rows[0]

    const existing = await pool.query(
      'SELECT id FROM memberships WHERE user_id = $1 AND group_id = $2',
      [user_id, group.id]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You are already a member of this group.' })
    }

    await pool.query(
      'INSERT INTO memberships (user_id, group_id) VALUES ($1, $2)',
      [user_id, group.id]
    )

    res.status(201).json({ message: 'Joined group successfully', group })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/groups/:groupId/members/:userId — admin removes a member
export const removeMember = async (req, res) => {
  const { groupId, userId } = req.params
  const { admin_id } = req.body

  try {
    const groupResult = await pool.query(
      'SELECT admin_id FROM groups WHERE id = $1',
      [groupId]
    )
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }
    if (groupResult.rows[0].admin_id !== parseInt(admin_id)) {
      return res.status(403).json({ error: 'Only the group admin can remove members.' })
    }
    if (parseInt(userId) === parseInt(admin_id)) {
      return res.status(400).json({ error: 'Admin cannot remove themselves.' })
    }

    const result = await pool.query(
      'DELETE FROM memberships WHERE user_id = $1 AND group_id = $2 RETURNING id',
      [userId, groupId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' })
    }

    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/groups/:id/deadline — admin sets or clears the voting deadline
export const updateDeadline = async (req, res) => {
  const { id } = req.params
  const { admin_id, voting_deadline } = req.body

  try {
    const groupResult = await pool.query('SELECT admin_id FROM groups WHERE id = $1', [id])
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }
    if (groupResult.rows[0].admin_id !== parseInt(admin_id)) {
      return res.status(403).json({ error: 'Only the group admin can update the deadline.' })
    }

    const result = await pool.query(
      'UPDATE groups SET voting_deadline = $1 WHERE id = $2 RETURNING *',
      [voting_deadline || null, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /api/groups/:id — admin deletes the group
export const deleteGroup = async (req, res) => {
  const { id } = req.params
  const { admin_id } = req.body

  try {
    const groupResult = await pool.query(
      'SELECT admin_id FROM groups WHERE id = $1',
      [id]
    )
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }
    if (groupResult.rows[0].admin_id !== parseInt(admin_id)) {
      return res.status(403).json({ error: 'Only the group admin can delete the group.' })
    }

    await pool.query('DELETE FROM groups WHERE id = $1', [id])
    res.json({ message: 'Group deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
