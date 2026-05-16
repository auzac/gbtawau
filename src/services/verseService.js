export const loadVerse = () => {
  const stored = localStorage.getItem('churchVerse')

  return stored
    ? JSON.parse(stored)
    : {
        reference: '',
        text: '',
        theme: ''
      }
}

export const saveVerse = (verse) => {
  localStorage.setItem('churchVerse', JSON.stringify(verse))
}