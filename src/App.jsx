// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App