// src/components/LandingPage.jsx
import React, { useState } from 'react'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#403A35] overflow-hidden">
      
      {/* Floating Top Bar */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        <div className="flex justify-between items-center px-6 md:px-10 py-6">
          
          {/* Church Name */}
          <div className="pointer-events-auto">
            <h1 className="text-sm md:text-base tracking-[0.25em] uppercase font-light text-[#5B534D]">
              Gereja Baptis Tawau
            </h1>
          </div>

          {/* Floating Menu Button */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center hover:scale-105 transition-all duration-300"
              aria-label="Toggle Menu"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 top-1 w-5 h-[1.5px] bg-[#4A443F] transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 top-2' : ''
                  }`}
                ></span>

                <span
                  className={`absolute left-0 top-3 w-5 h-[1.5px] bg-[#4A443F] transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 top-2' : ''
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#F7F4EF]/95 backdrop-blur-2xl transition-all duration-500 flex items-center justify-center ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center space-y-8">
          
          {['Home', 'About', 'Ministries', 'Contact'].map((item) => (
            <a
              key={item}
              href="#"
              onClick={() => setIsMenuOpen(false)}
              className="text-4xl md:text-6xl font-light tracking-wide text-[#4A443F] hover:opacity-50 transition-opacity duration-300"
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        
        {/* Background Ambient Layers */}
        <div className="absolute inset-0">
          
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white opacity-70 blur-[140px]"></div>

          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#EFE2D2] opacity-50 blur-[120px]"></div>

          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-[#F3E9DD] opacity-40 blur-[100px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          
          {/* Logo */}
          <div className="relative mb-16 animate-float">
            
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full bg-white opacity-40 blur-[90px]"></div>
            </div>

            {/* Logo Image */}
            <img
              src="/logo.png"
              alt="Gereja Baptis Tawau Logo"
              className="relative z-10 w-[320px] md:w-[460px] object-contain drop-shadow-[0_10px_40px_rgba(255,255,255,0.25)]"
            />
          </div>

          {/* Main Scripture */}
          <div className="space-y-8">
            
            <p className="max-w-4xl mx-auto text-3xl md:text-6xl leading-[1.2] font-serif font-light tracking-tight text-[#4A443F]">
              “Come to me, all you who are weary and burdened,
              and I will give you rest.”
            </p>

            <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-[#9B8E83]">
              Matthew 11:28
            </p>
          </div>

          {/* CTA */}
          <div className="mt-14">
            <button className="group relative overflow-hidden px-10 py-4 rounded-full bg-[#4A443F] text-[#F7F4EF] text-sm tracking-[0.2em] uppercase font-medium hover:scale-[1.03] transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              
              <span className="relative z-10">Member Portal</span>

              <div className="absolute inset-0 bg-[#5A524C] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-[#7A7067]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          <p className="text-sm uppercase tracking-[0.3em] text-[#A09184] mb-8">
            Welcome
          </p>

          <h2 className="text-4xl md:text-6xl font-serif font-light leading-[1.25] text-[#403A35]">
            A community of faith,
            hope, and love.
          </h2>

          <p className="mt-10 text-lg md:text-xl leading-[2] text-[#756B63] font-light max-w-3xl mx-auto">
            Whether you are seeking spiritual growth, fellowship,
            healing, or simply a place to belong, you are welcome here.
            Together we worship, learn, serve, and grow in Christ.
          </p>
        </div>
      </section>

      {/* Modern Info Cards */}
      <section className="relative pb-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="group bg-white/50 backdrop-blur-md rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300">
            
            <div className="text-3xl mb-8 opacity-70">⛪</div>

            <h3 className="text-2xl font-serif font-light text-[#403A35] mb-4">
              Worship
            </h3>

            <p className="text-[#756B63] leading-relaxed">
              Sunday services at 9:00 AM and 11:00 AM in a welcoming atmosphere of worship and fellowship.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/50 backdrop-blur-md rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300">
            
            <div className="text-3xl mb-8 opacity-70">🙏</div>

            <h3 className="text-2xl font-serif font-light text-[#403A35] mb-4">
              Prayer
            </h3>

            <p className="text-[#756B63] leading-relaxed">
              Join our midweek prayer gatherings every Wednesday at 7:30 PM as we seek God together.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/50 backdrop-blur-md rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300">
            
            <div className="text-3xl mb-8 opacity-70">🤝</div>

            <h3 className="text-2xl font-serif font-light text-[#403A35] mb-4">
              Fellowship
            </h3>

            <p className="text-[#756B63] leading-relaxed">
              Experience authentic community through gatherings, ministries, and shared life together.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          
          <p className="text-[#9C8E82] text-sm tracking-[0.2em] uppercase">
            Gereja Baptis Tawau
          </p>

          <p className="mt-3 text-[#B0A49A] text-sm">
            Jalan Belunu, Tawau, Sabah
          </p>

          <div className="w-16 h-px bg-[#DDD3C8] mx-auto my-8"></div>

          <p className="text-[#B0A49A] text-xs">
            © 2026 All Rights Reserved
          </p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage