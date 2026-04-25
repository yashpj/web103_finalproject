import express from 'express'
import { searchMovies } from '../controllers/moviesController.js'

const router = express.Router()

router.get('/movies/search', searchMovies)

export default router
