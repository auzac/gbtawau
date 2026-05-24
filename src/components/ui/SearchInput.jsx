// src/components/ui/SearchInput.jsx
import { Search } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          padding: '10px 12px 10px 34px', borderRadius: '10px',
          border: '1.5px solid #EAE1D4', fontSize: '14px',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          outline: 'none', width: '100%', boxSizing: 'border-box',
          background: '#FFFFFF', color: '#2D2926',
        }}
      />
      <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9A8B80', pointerEvents: 'none' }} />
    </div>
  )
}
