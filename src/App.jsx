// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import StaffHub from './pages/StaffHub'
import MemberManager from './pages/MemberManager'
import ContentManager from './pages/ContentManager'
import AdminTools from './pages/AdminTools'
import FinanceManager from './pages/FinanceManager'
import LyricsSession from './pages/LyricsSession'






// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D2926]/20 border-t-[#2D2926] rounded-full animate-spin" />
      </div>
    )
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