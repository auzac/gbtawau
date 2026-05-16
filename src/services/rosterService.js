export const loadRoster = () => {
  const stored = localStorage.getItem('churchRoster')
  return stored ? JSON.parse(stored) : []
}

export const saveRoster = (roster) => {
  localStorage.setItem('churchRoster', JSON.stringify(roster))
}