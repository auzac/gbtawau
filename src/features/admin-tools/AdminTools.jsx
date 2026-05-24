// src/features/admin-tools/AdminTools.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

function AdminTools() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/staff')} className="text-[#8A7A6E] hover:text-[#2D2926] text-xl">←</button>
              <div>
                <h1 className="text-base font-serif font-light text-[#2D2926]">Administrative Tools</h1>
                <p className="text-[9px] text-[#8A7A6E] tracking-wide">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-[#EAE1D4] p-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-serif text-[#2D2926] mb-2">Coming Soon</h2>
          <p className="text-[#8A7A6E] mb-6">
            Administrative tools for generating letters,<br />
            processing requests, and managing reports.
          </p>
          <button
            onClick={() => navigate('/staff')}
            className="bg-[#2D2926] text-white px-6 py-2 rounded-full text-sm hover:bg-[#4A3F38] transition"
          >
            Back to Staff Hub
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminTools
