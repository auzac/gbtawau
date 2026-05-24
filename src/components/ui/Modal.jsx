// src/components/ui/Modal.jsx
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, isMobile, children }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', zIndex: 100, backdropFilter: 'blur(2px)',
        ...(isMobile
          ? { alignItems: 'flex-end', justifyContent: 'center' }
          : { alignItems: 'center', justifyContent: 'center', padding: '24px' }),
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', width: '100%', overflowY: 'auto',
          ...(isMobile
            ? { borderRadius: '24px 24px 0 0', maxHeight: '92vh', paddingBottom: 'env(safe-area-inset-bottom,16px)' }
            : { borderRadius: '20px', maxWidth: '500px', maxHeight: '88vh' }),
        }}
        onClick={e => e.stopPropagation()}
      >
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 2px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: '#EAE1D4' }} />
          </div>
        )}
        <div style={{
          padding: isMobile ? '10px 20px 14px' : '24px 24px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{
            margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600,
            color: '#2D2926', fontFamily: "'Lora', 'Georgia', 'Times New Roman', serif",
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1.5px solid #EAE1D4', background: '#F5EFE6',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} color="#57534E" />
          </button>
        </div>
        <div style={{ height: '1px', background: '#EAE1D4' }} />
        <div style={{ padding: isMobile ? '16px 20px' : '20px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
