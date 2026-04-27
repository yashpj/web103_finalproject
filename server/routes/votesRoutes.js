import express from 'express'
import { getVotesByGroup, upsertVote, deleteVote } from '../controllers/votesController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/groups/:groupId/votes', authMiddleware, getVotesByGroup)
router.post('/votes', authMiddleware, upsertVote)
router.delete('/votes/:id', authMiddleware, deleteVote)

export default router
