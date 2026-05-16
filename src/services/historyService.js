const VERSE_HISTORY_KEY = 'churchVerseHistory'
const ROSTER_HISTORY_KEY = 'churchRosterHistory'

export const getVerseHistory = () => {
  return JSON.parse(localStorage.getItem(VERSE_HISTORY_KEY)) || []
}

export const saveVerseHistory = (entry) => {
  const existing = getVerseHistory()

  const updated = [entry, ...existing].slice(0, 50)

  localStorage.setItem(
    VERSE_HISTORY_KEY,
    JSON.stringify(updated)
  )

  return updated
}

export const getRosterHistory = () => {
  return JSON.parse(localStorage.getItem(ROSTER_HISTORY_KEY)) || []
}

export const saveRosterHistory = (entry) => {
  const existing = getRosterHistory()

  const updated = [entry, ...existing].slice(0, 100)

  localStorage.setItem(
    ROSTER_HISTORY_KEY,
    JSON.stringify(updated)
  )

  return updated
}