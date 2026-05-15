// src/components/LandingPage.jsx
import React from 'react'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header / Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            Gereja Baptis Tawau
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">Home</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">About</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">Ministries</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
          </nav>
          <button className="md:hidden text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section with Centered Cross and Glow Animation */}
      <section className="relative bg-gradient-to-r from-indigo-700 to-purple-700 min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        {/* Animated light beams/rays from behind the cross */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-96 h-96 rounded-full bg-yellow-300 opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-72 h-72 rounded-full bg-yellow-400 opacity-30 animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute w-48 h-48 rounded-full bg-yellow-200 opacity-40 animate-ping" style={{ animationDuration: '4s' }}></div>
        </div>

        {/* Rotating light beams */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[500px] h-[500px] rounded-full border-4 border-yellow-300/20 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border-2 border-yellow-400/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-yellow-500/20 animate-spin" style={{ animationDuration: '25s' }}></div>
        </div>

        {/* The Cross */}
        <div className="relative z-10 text-center">
          {/* Glow effect behind cross */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          </div>
          
          {/* Cross SVG with subtle animation */}
          <div className="transform hover:scale-105 transition-transform duration-500">
            <svg 
              className="w-32 h-32 md:w-48 md:h-48 text-white drop-shadow-2xl animate-glow"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Vertical beam */}
              <rect x="45" y="10" width="10" height="80" rx="2" fill="currentColor" />
              {/* Horizontal beam */}
              <rect x="20" y="42" width="60" height="10" rx="2" fill="currentColor" />
              {/* Optional: Jesus text (INRI) */}
              <text x="50" y="68" fontSize="8" fill="currentColor" textAnchor="middle" fontFamily="serif" className="opacity-80">INRI</text>
            </svg>
          </div>

          {/* Bible Verse below cross */}
          <div className="mt-8 max-w-2xl mx-auto px-4">
            <p className="text-white text-xl md:text-2xl italic leading-relaxed">
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </p>
            <p className="text-white/80 text-lg mt-2">— Matthew 11:28</p>
          </div>

          {/* Member Portal Button */}
          <div className="mt-10">
            <button className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:scale-105">
              Member Portal
            </button>
          </div>
        </div>
      </section>

      {/* Welcome / Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">A Place for Everyone</h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Gereja Baptis Tawau is a community of faith, hope, and love. Whether you're seeking spiritual growth, 
            fellowship, or a place to serve, you are welcome here. Join us as we worship, learn, and grow together in Christ.
          </p>
        </div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-indigo-600 text-4xl mb-3">⛪</div>
              <h3 className="text-xl font-semibold mb-2">Worship Services</h3>
              <p className="text-gray-600">Sunday 9:00 AM & 11:00 AM</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-indigo-600 text-4xl mb-3">🙏</div>
              <h3 className="text-xl font-semibold mb-2">Prayer Meeting</h3>
              <p className="text-gray-600">Wednesday 7:30 PM</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-indigo-600 text-4xl mb-3">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-semibold mb-2">Fellowship</h3>
              <p className="text-gray-600">Saturday 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Gereja Baptis Tawau</h3>
              <p className="text-gray-400 text-sm mt-1">Jalan Belunu, Tawau, Sabah</p>
            </div>
            <div className="text-center text-gray-400 text-sm">
              <p>© 2026 Gereja Baptis Tawau. All rights reserved.</p>
              <p className="mt-1">Built with 🤍 for His glory</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
            opacity: 0.95;
          }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default LandingPage