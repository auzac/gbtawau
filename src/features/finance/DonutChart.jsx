// src/features/finance/DonutChart.jsx
const C = { accentDark: '#92622E', border: '#EAE1D4' }
const font = { serif: "'Lora', serif", sans: "'DM Sans', sans-serif" }

export default function DonutChart({ pct }) {
  const r = 44, cx = 56, cy = 56
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={112} height={112} viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={10} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={C.accentDark} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '56px 56px', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily={font.serif} fontSize="18" fontWeight="600" fill={C.accentDark}>{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={font.sans} fontSize="10" fill="#9A8B80">paid</text>
    </svg>
  )
}
