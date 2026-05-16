// src/pages/StaffHub.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  ClipboardList,
  LogOut,
  ChevronRight,
  CalendarDays,
  Bell,
} from 'lucide-react'

function StaffHub() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  const modules = [
    {
      id: 'members',
      title: 'Members',
      icon: Users,
      description:
        'Manage church member records, profiles, and directory information.',
      action: 'Open Module',
      path: '/staff/members',
      featured: true,
      status: 'active',
    },
    {
      id: 'content',
      title: 'Content',
      icon: FileText,
      description:
        'Update weekly verses, announcements, worship rosters, and events.',
      action: 'Manage Content',
      path: '/staff/content',
      featured: false,
      status: 'active',
    },
    {
      id: 'admin',
      title: 'Administrative',
      icon: ClipboardList,
      description:
        'Letters, reporting tools, request processing, and administration.',
      action: 'Coming Soon',
      path: null,
      featured: false,
      status: 'coming',
    },
  ]

  const stats = [
    {
      label: 'Members',
      value: '248',
      icon: Users,
    },
    {
      label: 'Upcoming Events',
      value: '6',
      icon: CalendarDays,
    },
    {
      label: 'Pending Requests',
      value: '3',
      icon: Bell,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2926]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E7DED2]/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E7DED2] bg-white">
              <span className="font-serif text-lg">✝</span>
            </div>

            <div>
              <h1 className="font-serif text-[17px] font-light tracking-tight text-[#2D2926]">
                Gereja Baptis Tawau
              </h1>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-[#9B8B7B]">
                Staff Portal
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-[#E7DED2] bg-white px-4 py-2 text-sm text-[#6F6258] transition hover:bg-[#F5F1EC] hover:text-[#2D2926]"
          >
            <LogOut size={15} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Welcome */}
        <section className="mb-10">
          <div className="text-center">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#B09B87]">
              Internal Dashboard
            </p>

            <h2 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">
              Welcome, Staff
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#7A6E66]">
              Manage church operations, member information, and weekly ministry content from one central place.
            </p>

            <div className="mx-auto mt-5 h-px w-12 bg-[#D8CBBE]" />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-[#E7DED2]/70 bg-white/70 p-5 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#A39282]">
                      {stat.label}
                    </p>

                    <h3 className="mt-2 font-serif text-3xl font-light">
                      {stat.value}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EEE8]">
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className="text-[#6D6055]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* Module Layout */}
        <section className="grid gap-6 lg:grid-cols-3">

          {/* Featured Module */}
          <div className="lg:col-span-2">
            {modules
              .filter((module) => module.featured)
              .map((module) => {
                const Icon = module.icon

                return (
                  <div
                    key={module.id}
                    className="group rounded-[32px] border border-[#E7DED2]/70 bg-white/70 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-end">

                      {/* Left */}
                      <div className="max-w-lg">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EEE8]">
                          <Icon
                            size={26}
                            strokeWidth={1.7}
                            className="text-[#4E433B]"
                          />
                        </div>

                        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#B09B87]">
                          Primary Module
                        </p>

                        <h3 className="font-serif text-3xl font-light tracking-tight">
                          {module.title}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-[#786C63]">
                          {module.description}
                        </p>
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => navigate(module.path)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#2D2926] px-6 py-3 text-sm text-white transition hover:bg-[#4A3F38]"
                      >
                        {module.action}

                        <ChevronRight size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Secondary Modules */}
          <div className="space-y-6">
            {modules
              .filter((module) => !module.featured)
              .map((module) => {
                const Icon = module.icon

                return (
                  <div
                    key={module.id}
                    className={`rounded-[28px] border border-[#E7DED2]/70 bg-white/70 p-6 backdrop-blur-sm transition-all duration-300 ${
                      module.status === 'active'
                        ? 'hover:-translate-y-1 hover:shadow-lg'
                        : 'opacity-70'
                    }`}
                  >
                    {/* Icon */}
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EEE8]">
                      <Icon
                        size={22}
                        strokeWidth={1.8}
                        className="text-[#5E5147]"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="font-serif text-xl font-light tracking-tight">
                      {module.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-[#7A6E66]">
                      {module.description}
                    </p>

                    {/* Action */}
                    {module.status === 'active' ? (
                      <button
                        onClick={() => navigate(module.path)}
                        className="mt-6 inline-flex items-center gap-2 text-sm text-[#5F5349] transition hover:text-[#2D2926]"
                      >
                        {module.action}

                        <ChevronRight size={15} strokeWidth={1.8} />
                      </button>
                    ) : (
                      <div className="mt-6 inline-flex rounded-full border border-[#E7DED2] px-4 py-2 text-xs uppercase tracking-[0.15em] text-[#B1A396]">
                        Coming Soon
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-[#E7DED2]/70 pt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#B0A49A]">
            Gereja Baptis Tawau Internal System
          </p>

          <p className="mt-2 text-xs text-[#B0A49A]">
            Local preview environment • Supabase integration planned
          </p>
        </footer>
      </main>
    </div>
  )
}

export default StaffHub