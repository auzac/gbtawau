// src/components/ui/FieldLabel.jsx
export default function FieldLabel({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em',
      textTransform: 'uppercase', color: '#9A8B80', marginBottom: '6px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>{children}</label>
  )
}
