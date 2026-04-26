// GET /api/movies/search?q= — proxies TMDB search to keep API key server-side
export const searchMovies = async (req, res) => {
  const { q } = req.query
  if (!q || !q.trim()) return res.json([])

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return res.json([])

  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q.trim())}&language=en-US&page=1`
    const response = await fetch(url)
    if (!response.ok) return res.json([])

    const data = await response.json()
    const results = (data.results || []).slice(0, 6).map(m => ({
      id: m.id,
      title: m.title,
      poster_path: m.poster_path || null,
      release_date: m.release_date || ''
    }))
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /api/movies/:tmdbId — fetch full movie details + top cast from TMDB
export const getMovieDetails = async (req, res) => {
  const { tmdbId } = req.params
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'TMDB API key not configured' })

  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=en-US&append_to_response=credits`
    const response = await fetch(url)
    if (!response.ok) return res.status(response.status).json({ error: 'Movie not found' })

    const m = await response.json()
    const cast = (m.credits?.cast || []).slice(0, 8).map(c => ({
      name: c.name,
      character: c.character,
      profile_path: c.profile_path || null
    }))
    const director = (m.credits?.crew || []).find(c => c.job === 'Director')

    res.json({
      id: m.id,
      title: m.title,
      tagline: m.tagline || null,
      overview: m.overview || null,
      release_date: m.release_date || null,
      runtime: m.runtime || null,
      genres: (m.genres || []).map(g => g.name),
      poster_path: m.poster_path || null,
      backdrop_path: m.backdrop_path || null,
      vote_average: m.vote_average || null,
      vote_count: m.vote_count || null,
      status: m.status || null,
      original_language: m.original_language || null,
      director: director ? director.name : null,
      cast
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
