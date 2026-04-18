import express from 'express'
import { getVotesByGroup, upsertVote, deleteVote } from '../controllers/votesController.js'

const router = express.Router()

router.get('/groups/:groupId/votes', getVotesByGroup)
router.post('/votes', upsertVote)
router.delete('/votes/:id', deleteVote)

export default router
