import { useNavigate } from 'react-router-dom'

function PageHeader({ title, subtitle, actions }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#EEE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff')}
            className="w-10 h-10 rounded-xl border border-[#EEE6DC] text-[#6F655D] hover:bg-[#F7F3EE]"
          >
            ←
          </button>

          <div>
            <h1 className="text-lg font-medium text-[#2D2926]">{title}</h1>
            <p className="text-xs text-[#9B8E84] mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </header>
  )
}

export default PageHeader