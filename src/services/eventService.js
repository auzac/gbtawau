export const loadEvents = () => {
  const stored = localStorage.getItem('churchEvents')
  return stored ? JSON.parse(stored) : []
}

export const saveEvents = (events) => {
  localStorage.setItem('churchEvents', JSON.stringify(events))
}