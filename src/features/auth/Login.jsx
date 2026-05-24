// src/features/auth/Login.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft } from 'lucide-react'
import { signIn } from '../../services/auth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate('/staff')
    } catch (signInError) {
      setError(signInError.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#F7F2EB] to-[#EFE7DC] flex items-center justify-center px-4 relative overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#C4A88B]/10 rounded-full blur-3xl top-[-150px] right-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-[#D8C2A8]/10 rounded-full blur-3xl bottom-[-150px] left-[-100px]" />

      <div className="relative w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-white/60 p-8 animate-fade-in-up">

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-5 left-5 w-9 h-9 rounded-full hover:bg-[#F5EFE6] flex items-center justify-center transition-colors"
          aria-label="Return to homepage"
        >
          <ArrowLeft size={16} className="text-[#8A7A6E]" />
        </button>

        {/* Cross */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-[#C4A88B]/20 blur-xl rounded-full scale-150" />

            {/* Elegant Cross */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute w-[2px] h-10 bg-gradient-to-b from-[#C8A97E] to-[#8C6A43] rounded-full" />
              <div className="absolute w-6 h-[2px] top-[11px] bg-gradient-to-r from-[#C8A97E] to-[#8C6A43] rounded-full" />
            </div>
          </div>

          <h1 className="text-2xl font-serif text-[#2D2926] tracking-tight">
            Staff Login
          </h1>

          <p className="text-sm text-[#9C8E84] mt-2">
            Gereja Baptis Tawau
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DED1] bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#C4A88B]/40 focus:border-[#C4A88B]/30 text-[#2D2926] placeholder:text-[#B6AAA2] text-sm transition-all"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-red-500 text-xs text-center">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2D2926] hover:bg-[#433A34] text-white py-3.5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:opacity-60"
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

        {/* Footer */}
        <p className="text-center text-[11px] text-[#B6AAA2] mt-6">
          Sign in with your staff email and password
        </p>
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
          animation: fade-in-up 0.45s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login
