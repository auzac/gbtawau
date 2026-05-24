// src/hooks/useToast.js
import { useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = (text, isError = false, duration = 2500) => {
    setToast({ text, isError })
    setTimeout(() => setToast(null), duration)
  }

  return { toast, showToast }
}
