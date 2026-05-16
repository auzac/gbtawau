import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple demo auth — in production, add real authentication
    if (email && password) {
      navigate('/staff')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#EAE1D4] p-8">
        {/* Logo / Church Name */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.webp" alt="Logo" className="w-20 h-20 object-contain opacity-90" />
          </div>
          <h1 className="text-2xl font-serif font-light text-[#2D2926]">Gereja Baptis Tawau</h1>
          <p className="text-[#8A7A6E] text-sm mt-1">Staff Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#5B534D] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent bg-white"
              placeholder="staff@gbtawau.org"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5B534D] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#EAE1D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent bg-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D2926] text-white py-2 rounded-full hover:bg-[#4A3F38] transition mt-6"
          >
            Login
          </button>
        </form>

        {/* Demo note (remove in production) */}
        <p className="text-center text-xs text-[#B0A49A] mt-6">
          Demo: any email/password works
        </p>
      </div>
    </div>
  )
}

export default Login