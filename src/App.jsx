// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'

import LandingPage from './features/public-home/LandingPage'
import Login from './features/auth/Login'
import StaffHub from './features/dashboard/StaffHub'
import MemberManager from './features/members/MemberManager'
import ContentManager from './features/content/ContentManager'
import AdminTools from './features/admin-tools/AdminTools'
import FinanceManager from './features/finance/FinanceManager'
import LyricsSession from './features/lyrics/LyricsSession'

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner size="32px" thickness="2px" />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// This component MUST be inside AuthProvider to use useAuth
function AppRoutes() {
  return (
    <Routes>
      {/* Public Website */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Staff Portal (Protected) */}
      <Route path="/staff" element={
        <ProtectedRoute>
          <StaffHub />
        </ProtectedRoute>
      } />
      <Route path="/staff/members" element={
        <ProtectedRoute>
          <MemberManager />
        </ProtectedRoute>
      } />
      <Route path="/staff/content" element={
        <ProtectedRoute>
          <ContentManager />
        </ProtectedRoute>
      } />
      <Route path="/staff/admin" element={
        <ProtectedRoute>
          <AdminTools />
        </ProtectedRoute>
      } />
      <Route path="/staff/finance" element={
        <ProtectedRoute>
          <FinanceManager />
        </ProtectedRoute>
      } />
      <Route path="/lyrics/*" element={<LyricsSession />} />
    </Routes>
  )
}

// Main App - AuthProvider wraps everything that uses useAuth
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
