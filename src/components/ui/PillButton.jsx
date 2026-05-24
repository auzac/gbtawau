// src/components/ui/PillButton.jsx
export default function PillButton({ onClick, children, primary, danger, disabled, type = 'button', style = {} }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', padding: '10px 18px', borderRadius: '12px',
        fontSize: '14px', fontWeight: 600,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: primary ? 'none' : `1.5px solid ${danger ? '#FECACA' : '#EAE1D4'}`,
        background: disabled ? '#EAE1D4' : primary ? '#2D2926' : danger ? '#FEF2F2' : '#FFFFFF',
        color: disabled ? '#9A8B80' : primary ? '#fff' : danger ? '#DC2626' : '#57534E',
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
