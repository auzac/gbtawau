// src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner({
  background = '#FAF8F5',
  borderColor = 'rgba(45,41,38,0.2)',
  accentColor = '#2D2926',
  size = '34px',
  thickness = '3px',
  children,
}) {
  return (
    <div style={{ minHeight: '100vh', background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: children ? '14px' : 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', border: `${thickness} solid ${borderColor}`, borderTopColor: accentColor, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {children}
    </div>
  )
}
