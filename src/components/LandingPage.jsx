// src/components/LandingPage.jsx
import React, { useState } from 'react'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#4A443F] selection:bg-[#EAE1D4]">
      
      {/* Header / Navigation */}
      <header className="bg-[#FBF9F6]/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#EAE1D4]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          
          <div className="text-xl font-medium tracking-wide text-[#3D3732]">
            Gereja Baptis Tawau
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Home
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              About
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Ministries
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#4A443F] focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={
                  isMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#FBF9F6] border-b border-[#EAE1D4] px-6 py-4 space-y-3 flex flex-col text-sm font-medium tracking-wide">
            
            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Home
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              About
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Ministries
            </a>

            <a
              href="#"
              className="text-[#7A7067] hover:text-[#3D3732] transition-colors"
            >
              Contact
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-between py-12 overflow-hidden bg-[#F5EFE6]">
        
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-[#FFFBF5] opacity-60 blur-3xl animate-pulse"
            style={{ animationDuration: '6s' }}
          ></div>

          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#EFE3D3] opacity-40 blur-2xl"></div>
        </div>

        <div className="hidden sm:block h-4"></div>

        {/* Hero Core */}
        <div className="relative w-full max-w-xl px-6 flex flex-col items-center justify-center z-10 my-auto">
          
          {/* Church Logo Container */}
          <div className="relative flex items-center justify-center w-[340px] sm:w-[420px] mb-10 group">
            
            {/* Main Glow */}
            <div className="absolute w-56 h-56 bg-white rounded-full blur-3xl opacity-40 animate-beam-expand"></div>

            {/* Secondary Warm Glow */}
            <div
              className="absolute w-40 h-40 bg-[#FFF0DB] rounded-full blur-2xl opacity-30 animate-beam-expand"
              style={{ animationDelay: '-2s' }}
            ></div>

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Gereja Baptis Tawau Logo"
              className="relative z-10 w-full h-auto object-contain animate-logo-glow"
            />
          </div>

          {/* Verse */}
          <div className="text-center space-y-4">
            
            <p className="text-[#5C544E] text-lg md:text-xl font-serif italic tracking-wide leading-relaxed max-w-md mx-auto">
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </p>

            <p className="text-[#9C8E82] text-xs uppercase tracking-widest font-medium">
              — Matthew 11:28
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <button className="bg-[#4A443F] text-[#FBF9F6] px-8 py-3 rounded-md text-sm font-medium tracking-wide hover:bg-[#5C544E] transition-all shadow-sm hover:shadow-md">
              Member Portal
            </button>
          </div>
        </div>

        {/* Bottom Arrow */}
        <div className="text-[#9C8E82] animate-bounce opacity-40 mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
      <section className="py-24 bg-[#FBF9F6]">
        <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
          
          <h2 className="text-2xl md:text-3xl font-normal tracking-wide text-[#3D3732]">
            A Place for Everyone
          </h2>

          <div className="w-12 h-[1px] bg-[#CDBCAC] mx-auto"></div>

          <p className="text-[#7A7067] text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Gereja Baptis Tawau is a community of faith, hope, and love.
            Whether you're seeking spiritual growth, fellowship, or a place to
            serve, you are welcome here. Join us as we worship, learn, and grow
            together in Christ.
          </p>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-20 bg-[#F5EFE6]/50 border-t border-b border-[#EAE1D4]">
        <div className="container mx-auto px-6">
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            <div className="bg-[#FBF9F6] p-8 rounded-lg border border-[#EAE1D4]/60 text-center space-y-3 shadow-sm">
              <div className="text-[#9C8E82] text-xl font-light">⛪</div>

              <h3 className="text-md font-medium tracking-wide text-[#3D3732]">
                Worship Services
              </h3>

              <p className="text-[#7A7067] text-sm font-light">
                Sunday 9:00 AM & 11:00 AM
              </p>
            </div>

            <div className="bg-[#FBF9F6] p-8 rounded-lg border border-[#EAE1D4]/60 text-center space-y-3 shadow-sm">
              <div className="text-[#9C8E82] text-xl font-light">🙏</div>

              <h3 className="text-md font-medium tracking-wide text-[#3D3732]">
                Prayer Meeting
              </h3>

              <p className="text-[#7A7067] text-sm font-light">
                Wednesday 7:30 PM
              </p>
            </div>

            <div className="bg-[#FBF9F6] p-8 rounded-lg border border-[#EAE1D4]/60 text-center space-y-3 shadow-sm">
              <div className="text-[#9C8E82] text-xl font-light">
                👨‍👩‍👧‍👦
              </div>

              <h3 className="text-md font-medium tracking-wide text-[#3D3732]">
                Fellowship
              </h3>

              <p className="text-[#7A7067] text-sm font-light">
                Saturday 4:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3D3732] text-[#EAE1D4] py-12 border-t border-[#4A443F]">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            <div className="text-center md:text-left">
              <h3 className="text-lg font-medium tracking-wide text-[#FBF9F6]">
                Gereja Baptis Tawau
              </h3>

              <p className="text-[#9C8E82] text-xs mt-1">
                Jalan Belunu, Tawau, Sabah
              </p>
            </div>

            <div className="text-center md:text-right text-xs text-[#9C8E82] space-y-1">
              <p>© 2026 Gereja Baptis Tawau. All rights reserved.</p>

              <p className="font-light opacity-75">
                Built for His glory
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes logoGlow {
          0%, 100% {
            filter:
              drop-shadow(0 0 8px rgba(255,255,255,0.25))
              drop-shadow(0 0 20px rgba(255,255,255,0.15));
            transform: scale(1);
          }

          50% {
            filter:
              drop-shadow(0 0 18px rgba(255,255,255,0.45))
              drop-shadow(0 0 40px rgba(255,255,255,0.25));
            transform: scale(1.01);
          }
        }

        @keyframes beamExpand {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.5;
          }

          50% {
            transform: scale(1.35);
            opacity: 0.85;
          }
        }

        .animate-logo-glow {
          animation: logoGlow 5s ease-in-out infinite;
        }

        .animate-beam-expand {
          animation: beamExpand 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage