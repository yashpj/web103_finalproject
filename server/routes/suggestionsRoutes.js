import express from 'express'
import {
  getSuggestionsByGroup,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion
} from '../controllers/suggestionsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/groups/:groupId/suggestions', authMiddleware, getSuggestionsByGroup)
router.post('/groups/:groupId/suggestions', authMiddleware, createSuggestion)
router.put('/suggestions/:id', authMiddleware, updateSuggestion)
router.delete('/suggestions/:id', authMiddleware, deleteSuggestion)

export default router
