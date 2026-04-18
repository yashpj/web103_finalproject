/**
 * Given a list of suggestions (each with avg_rating and vote_count),
 * return the top 3 by average rating descending.
 * Suggestions with no votes are excluded.
 */
export function calculateTop3(suggestions) {
  return suggestions
    .filter((s) => parseInt(s.vote_count) > 0)
    .sort((a, b) => {
      const ratingDiff = parseFloat(b.avg_rating) - parseFloat(a.avg_rating)
      if (ratingDiff !== 0) return ratingDiff
      // Tiebreak: more votes ranks higher
      return parseInt(b.vote_count) - parseInt(a.vote_count)
    })
    .slice(0, 3)
}
