function ModalShell({ title, children, onClose, width = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EEE6DC]">
          <h2 className="text-lg font-medium text-[#2D2926]">{title}</h2>

          <button
            onClick={onClose}
            className="text-[#8A7A6E] hover:text-[#2D2926] text-xl"
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