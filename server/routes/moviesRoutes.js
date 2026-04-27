import express from 'express'
import { searchMovies, getMovieDetails } from '../controllers/moviesController.js'

const router = express.Router()

router.get('/movies/search', searchMovies)
router.get('/movies/:tmdbId', getMovieDetails)

export default router
