// src/pages/StaffHub.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  ShieldCheck,
  LogOut,
  CalendarDays,
  UserRound
} from 'lucide-react'

function StaffHub() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  const modules = [
    {
      id: 'members',
      title: 'Membership',
      icon: Users,
      description:
        'Manage church members, profiles, and directory records.',
      action: 'Open Module',
      path: '/staff/members',
      active: true
    },
    {
      id: 'content',
      title: 'Content',
      icon: FileText,
      description:
        'Update weekly verses, worship schedules, announcements, and events.',
      action: 'Open Module',
      path: '/staff/content',
      active: true
    },
    {
      id: 'admin',
      title: 'Administrative',
      icon: ShieldCheck,
      description:
        'Letters, reporting tools, approvals, and administrative workflows.',
      action: 'Coming Soon',
      path: null,
      active: false
    }
  ]

  const stats = [
    {
      label: 'Total Members',
      value: '248',
      icon: UserRound
    },
    {
      label: 'Upcoming Events',
      value: '4',
      icon: CalendarDays
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-[#EAE1D4]/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            
            {/* Brand */}
            <div>
              <h1 className="font-serif text-[18px] text-[#2D2926] leading-none">
                Gereja Baptis Tawau
              </h1>
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#9A8D82] mt-1">
                Staff Portal
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#7A6A5E] hover:text-[#2D2926] transition"
            >
              <LogOut size={16} strokeWidth={1.8} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-5 sm:px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2926] font-light tracking-[-0.02em]">
            Welcome back
          </h2>

          <p className="text-[#8A7A6E] text-sm mt-2">
            Manage church operations and internal content.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="bg-white border border-[#ECE4D9] rounded-3xl p-6"
              >
                <div className="flex items-start justify-between">
                  
                  <div>
                    <p className="text-sm text-[#8A7A6E] mb-3">
                      {stat.label}
                    </p>

                    <h3 className="text-4xl font-light text-[#2D2926] tracking-[-0.04em]">
                      {stat.value}
                    </h3>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-[#F4EFE8] flex items-center justify-center">
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className="text-[#6F6258]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modules */}
        <div className="grid lg:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon

            return (
              <div
                key={module.id}
                className={`group rounded-3xl border p-7 flex flex-col justify-between min-h-[260px] transition-all duration-300 ${
                  module.active
                    ? 'bg-white border-[#ECE4D9] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                    : 'bg-[#F8F5F1] border-[#ECE4D9] opacity-80'
                }`}
              >
                
                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EEE7] flex items-center justify-center mb-6">
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      className="text-[#6F6258]"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-[22px] text-[#2D2926] tracking-[-0.02em] mb-3">
                    {module.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[15px] leading-7 text-[#7A6A5E]">
                    {module.description}
                  </p>
                </div>

                {/* Action */}
                <div className="pt-8">
                  {module.active ? (
                    <button
                      onClick={() => navigate(module.path)}
                      className="w-full h-11 rounded-full border border-[#E7DED2] bg-[#FAF8F5] text-[#2D2926] text-sm hover:bg-white transition"
                    >
                      {module.action} →
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full h-11 rounded-full border border-[#E7DED2] bg-[#F1ECE6] text-[#B0A49A] text-sm cursor-not-allowed"
                    >
                      {module.action}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-12">
          <div className="w-10 h-px bg-[#D8CCC0] mx-auto mb-4" />

          <p className="text-center text-[11px] tracking-wide text-[#B0A49A]">
            Gereja Baptis Tawau • Internal Staff System
          </p>
        </div>
      </main>
    </div>
  )
}

export default StaffHub