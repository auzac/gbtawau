// src/components/ui/IconButton.jsx
export default function IconButton({ onClick, children, danger, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: `1.5px solid ${danger ? '#FECACA' : '#EAE1D4'}`,
        background: danger ? '#FEF2F2' : '#F5EFE6',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, ...style,
      }}
    >
      {children}
    </button>
  )
}
