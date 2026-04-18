import express from 'express'
import {
  getSuggestionsByGroup,
  createSuggestion,
  updateSuggestion,
  deleteSuggestion
} from '../controllers/suggestionsController.js'

const router = express.Router()

router.get('/groups/:groupId/suggestions', getSuggestionsByGroup)
router.post('/groups/:groupId/suggestions', createSuggestion)
router.put('/suggestions/:id', updateSuggestion)
router.delete('/suggestions/:id', deleteSuggestion)

export default router
