export default function ProgressBar({ label, value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="stat-row">
      <div className="stat-label">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="progress-track" aria-label={`${label}: ${safeValue}% complete`}>
        <div className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
