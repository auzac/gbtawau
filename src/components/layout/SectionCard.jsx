import React from 'react'

function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-white border border-[#EAE1D4] rounded-2xl p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h2 className="text-lg font-serif text-[#2D2926]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[#8A7A6E] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  )
}

export default SectionCard