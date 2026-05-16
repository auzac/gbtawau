export const getWeekDateRange = (year, month, weekNumber) => {
  const firstDay = new Date(year, month, 1)

  const firstDayOfWeek = firstDay.getDay()

  const startDate = new Date(year, month, 1)

  const dayOffset = firstDayOfWeek === 0
    ? 6
    : firstDayOfWeek - 1

  startDate.setDate(
    1 - dayOffset + (weekNumber - 1) * 7
  )

  const endDate = new Date(startDate)

  endDate.setDate(startDate.getDate() + 6)

  return {
    startDate,
    endDate
  }
}

export const formatDateRange = (start, end) => {
  const options = {
    day: 'numeric',
    month: 'short'
  }

  return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`
}