// src/features/finance/MiniStat.jsx
const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function MiniStat({ label, value, hi }) {
  return (
    <div style={{ flexShrink: 0, textAlign: 'center', padding: '10px 16px', borderRadius: '12px', background: hi ? '#2D2926' : '#FFFFFF', border: `1.5px solid ${hi ? '#2D2926' : '#EAE1D4'}`, minWidth: '90px' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: font.serif, color: hi ? '#fff' : '#2D2926', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: hi ? '#A89080' : '#9A8B80', marginTop: '4px', fontFamily: font.sans }}>{label}</div>
    </div>
  )
}
