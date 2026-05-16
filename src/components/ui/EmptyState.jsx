import React from 'react'

function EmptyState({ title, description, action }) {
  return (
    <div className="bg-white border border-dashed border-[#DDD2C3] rounded-2xl p-10 text-center">
      <h3 className="text-lg font-serif text-[#2D2926] mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#8A7A6E] max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState