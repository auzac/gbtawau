// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import StaffHub from './pages/StaffHub'
import MemberManager from './pages/MemberManager'
import ContentManager from './pages/ContentManager'
import AdminTools from './pages/AdminTools'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Staff Portal (protected routes - auth coming later) */}
          <Route path="/staff" element={<StaffHub />} />
          <Route path="/staff/members" element={<MemberManager />} />
          <Route path="/staff/content" element={<ContentManager />} />
          <Route path="/staff/admin" element={<AdminTools />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App