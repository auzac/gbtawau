export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB')
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-GB')
}

export const getDayName = (dateString) => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]

  return days[new Date(dateString).getDay()]
}