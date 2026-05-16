import React from 'react'

function ModalShell({ title, children, onClose, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EFE7DC] sticky top-0 bg-white z-10 rounded-t-3xl">
          <h2 className="text-xl font-serif text-[#2D2926]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-[#8A7A6E] hover:text-[#2D2926] text-2xl leading-none transition"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default ModalShell