// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn, Shield } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    
    // Simulate network delay (remove when adding real auth)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simple demo auth — replace with Supabase later
    if (email && password) {
      navigate('/staff')
    } else {
      setError('Invalid credentials')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F0E9DF] flex items-center justify-center px-4">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-4 sm:left-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#EAE1D4] text-[#5E5247] hover:bg-white transition shadow-sm z-10"
      >
        <ArrowLeft size={16} />
        <span className="text-sm hidden sm:inline">Back to Home</span>
        <span className="text-sm sm:hidden">Back</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        
        {/* Decorative top element */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#CDBCAC] to-transparent" />
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-[#EAE1D4] p-6 sm:p-8">
          
          {/* Logo & Church Name */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[#F5EFE6] flex items-center justify-center">
                <img 
                  src="/logo.webp" 
                  alt="Logo" 
                  className="w-16 h-16 object-contain opacity-90" 
                />
              </div>
            </div>
            <h1 className="text-2xl font-serif text-[#2D2926] tracking-wide">
              Gereja Baptis Tawau
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield size={12} className="text-[#B09882]" />
              <p className="text-[#8A7A6E] text-sm tracking-wide">Staff Portal</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-6">
            <p className="text-[#5E5247] text-sm">
              Welcome back. Please sign in to access the staff dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#5B534D] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE1D4] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent transition-all text-[#2D2926] placeholder:text-[#C0B5AF]"
                placeholder="staff@gbtawau.org"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#5B534D] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE1D4] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent transition-all text-[#2D2926] placeholder:text-[#C0B5AF]"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D2926] text-white py-3 rounded-xl font-medium hover:bg-[#4A3F38] transition-all duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-[#F0EAE2] text-center">
            <p className="text-xs text-[#B0A49A]">
              Secure staff access only
            </p>
            <p className="text-[10px] text-[#C0B5AF] mt-1">
              Demo: any email/password works
            </p>
          </div>
        </div>

        {/* Decorative bottom element */}
        <div className="flex justify-center mt-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#CDBCAC] to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login