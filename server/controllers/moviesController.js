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
