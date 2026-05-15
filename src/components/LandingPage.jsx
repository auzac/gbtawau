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

      {/* Hero Section with Bible Verse */}
      <section className="relative bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome Home</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl italic mb-4">
              "Come to me, all you who are weary and burdened, and I will give you rest."
            </p>
            <p className="text-lg md:text-xl">— Matthew 11:28</p>
          </div>
          <div className="mt-10">
            <button className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
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
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-indigo-600 text-4xl mb-3">⛪</div>
              <h3 className="text-xl font-semibold mb-2">Worship Services</h3>
              <p className="text-gray-600">Sunday 9:00 AM & 11:00 AM</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-indigo-600 text-4xl mb-3">🙏</div>
              <h3 className="text-xl font-semibold mb-2">Prayer Meeting</h3>
              <p className="text-gray-600">Wednesday 7:30 PM</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
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
    </div>
  )
}

//
export default LandingPage