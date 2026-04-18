/**
 * Validate a movie suggestion before submission.
 * @param {string} title
 * @param {string[]} existingTitles - titles already in this group
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateSuggestion(title, existingTitles = []) {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Movie title is required.' }
  }
  if (title.trim().length > 200) {
    return { valid: false, error: 'Title must be 200 characters or fewer.' }
  }
  const isDuplicate = existingTitles.some(
    (t) => t.toLowerCase() === title.trim().toLowerCase()
  )
  if (isDuplicate) {
    return { valid: false, error: 'This movie has already been suggested in this group.' }
  }
  return { valid: true, error: null }
}

/**
 * Validate a group name.
 * @param {string} name
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateGroupName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Group name is required.' }
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Group name must be 100 characters or fewer.' }
  }
  return { valid: true, error: null }
}
