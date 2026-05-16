// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft, Cross } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Demo auth — replace with Supabase later
    if (email && password) {
      navigate('/staff')
    } else {
      setError('Invalid credentials')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] to-[#F0E9DF] flex items-center justify-center px-4">
      
      {/* Login Card — Single, self-contained */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#EAE1D4] p-6 animate-fade-in-up">
        
        {/* Simple Cross Icon + Close/Return integrated */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-8 h-8 rounded-full bg-[#2D2926]/5 flex items-center justify-center">
            <Cross size={16} className="text-[#2D2926]/60" />
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full hover:bg-[#F5EFE6] flex items-center justify-center transition"
            aria-label="Return to homepage"
          >
            <ArrowLeft size={16} className="text-[#8A7A6E]" />
          </button>
        </div>

        {/* Simple Title */}
        <h1 className="text-xl font-serif text-[#2D2926] text-center mb-6">
          Staff Login
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#EAE1D4] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent text-[#2D2926] placeholder:text-[#C0B5AF] text-sm"
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#EAE1D4] bg-white focus:outline-none focus:ring-2 focus:ring-[#C4A88B] focus:border-transparent text-[#2D2926] placeholder:text-[#C0B5AF] text-sm"
              placeholder="Password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-red-50">
              <p className="text-red-500 text-xs text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D2926] text-white py-3 rounded-xl font-medium hover:bg-[#4A3F38] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Subtle demo note */}
        <p className="text-center text-[10px] text-[#C0B5AF] mt-6">
          Demo: any email/password
        </p>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login