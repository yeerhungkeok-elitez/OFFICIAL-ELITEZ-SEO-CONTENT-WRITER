const STYLES = {
  green:  'bg-green-100 text-green-700 border-green-200',
  blue:   'bg-blue-100 text-blue-700 border-blue-200',
  amber:  'bg-amber-100 text-amber-700 border-amber-200',
  red:    'bg-red-100 text-red-700 border-red-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  slate:  'bg-slate-100 text-slate-600 border-slate-200',
  brand:  'bg-brand-100 text-brand-700 border-brand-200',
}

export default function Badge({ label, color = 'slate', dot = false, size = 'sm' }) {
  const style = STYLES[color] || STYLES.slate
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${sizeClass}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          color === 'green' ? 'bg-green-500' :
          color === 'blue'  ? 'bg-blue-500'  :
          color === 'amber' ? 'bg-amber-500' :
          color === 'red'   ? 'bg-red-500'   :
          color === 'brand' ? 'bg-brand-500' :
          'bg-slate-400'
        }`} />
      )}
      {label}
    </span>
  )
}

export function IntentBadge({ intent }) {
  const map = {
    'Informational': { color: 'blue',  label: 'Informational' },
    'Commercial':    { color: 'purple',label: 'Commercial' },
    'Transactional': { color: 'green', label: 'Transactional' },
    'Navigational':  { color: 'slate', label: 'Navigational' },
  }
  const cfg = map[intent] || { color: 'slate', label: intent }
  return <Badge label={cfg.label} color={cfg.color} />
}

export function FunnelBadge({ funnel }) {
  const map = {
    'TOFU': { color: 'blue',  label: 'TOFU' },
    'MOFU': { color: 'amber', label: 'MOFU' },
    'BOFU': { color: 'green', label: 'BOFU' },
  }
  const cfg = map[funnel] || { color: 'slate', label: funnel }
  return <Badge label={cfg.label} color={cfg.color} dot />
}

export function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null
  return <Badge label={difficulty.label} color={difficulty.color} />
}
