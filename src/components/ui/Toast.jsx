// src/components/ui/Toast.jsx
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Toast({ message, isError = false }) {
  return (
    <div style={{
      position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, animation: 'slideDown 0.2s ease-out', whiteSpace: 'nowrap',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '9px 18px', borderRadius: '99px',
        background: isError ? '#DC2626' : '#2D2926',
        color: '#fff', fontSize: '13px', fontWeight: 600,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        {isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
        {message}
      </div>
    </div>
  )
}
