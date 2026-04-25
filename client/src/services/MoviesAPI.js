const BASE_URL = '/api'

export const searchMovies = async (query) => {
  const res = await fetch(`${BASE_URL}/movies/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
