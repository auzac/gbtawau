import React, { createContext, useState, useContext, useEffect } from 'react'
import bm from '../locales/bm.json'
import en from '../locales/en.json'

const translations = { bm, en }

const LocaleContext = createContext()

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'bm'
  })

  const t = (key) => translations[locale][key] || key

  const toggleLocale = () => {
    const newLocale = locale === 'bm' ? 'en' : 'bm'
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'bm' ? 'ms' : 'en'
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)