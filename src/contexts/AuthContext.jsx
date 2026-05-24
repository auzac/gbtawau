import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSession, onAuthStateChange, signOut as serviceSignOut } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getSession().then(session => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const subscription = onAuthStateChange((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await serviceSignOut()
    setUser(null)  // ← CRITICAL: clear user state immediately
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}