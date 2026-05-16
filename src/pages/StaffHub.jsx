// src/pages/StaffHub.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

function StaffHub() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // For now, just redirect to login
    // Later: Supabase sign out
    navigate('/login')
  }

  const modules = [
    {
      id: 'members',
      title: 'Members',
      icon: '👥',
      description: 'Manage member directory — add, edit, and remove member profiles.',
      action: 'Go to Members',
      path: '/staff/members',
      color: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      status: 'active'
    },
    {
      id: 'content',
      title: 'Content',
      icon: '✏️',
      description: 'Update weekly verse, upcoming events, and worship roster.',
      action: 'Go to Content',
      path: '/staff/content',
      color: 'from-amber-50 to-yellow-50',
      iconBg: 'bg-amber-100',
      status: 'active'
    },
    {
      id: 'admin',
      title: 'Administrative',
      icon: '📋',
      description: 'Generate letters, process requests, and manage reports.',
      action: 'Coming Soon',
      path: null,
      color: 'from-gray-50 to-stone-50',
      iconBg: 'bg-gray-100',
      status: 'coming'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EAE1D4] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">✝</span>
              <div>
                <h1 className="text-base font-serif font-light text-[#2D2926]">Gereja Baptis Tawau</h1>
                <p className="text-[9px] text-[#8A7A6E] tracking-wide">Staff Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#8A7A6E] hover:text-[#2D2926] text-xs transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Welcome */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#2D2926]">
            Welcome, Staff
          </h2>
          <p className="text-[#8A7A6E] text-sm mt-1">
            Select a module to begin
          </p>
          <div className="w-12 h-px bg-[#CDBCAC] mx-auto mt-4" />
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`bg-gradient-to-br ${module.color} rounded-2xl border border-[#EAE1D4] p-6 transition-all duration-200 ${
                module.status === 'active' ? 'hover:shadow-md hover:-translate-y-1' : 'opacity-75'
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${module.iconBg} flex items-center justify-center text-3xl mb-4`}>
                {module.icon}
              </div>
              
              {/* Title & Description */}
              <h3 className="text-lg font-serif font-medium text-[#2D2926] mb-2">
                {module.title}
              </h3>
              <p className="text-[#7A6A5E] text-sm leading-relaxed mb-5">
                {module.description}
              </p>
              
              {/* Action Button */}
              {module.status === 'active' ? (
                <button
                  onClick={() => navigate(module.path)}
                  className="w-full bg-white/80 border border-[#EAE1D4] text-[#2D2926] py-2 rounded-full text-sm hover:bg-white transition"
                >
                  {module.action} →
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 text-gray-400 py-2 rounded-full text-sm cursor-not-allowed"
                >
                  {module.action}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[10px] text-[#B0A49A] mt-10 tracking-wide">
          Data is stored locally for preview • Supabase integration coming soon
        </p>
      </main>
    </div>
  )
}

export default StaffHub