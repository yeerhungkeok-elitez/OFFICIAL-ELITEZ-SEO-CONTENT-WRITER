export default function Card({ children, className = '', padding = true, border = true }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm ${border ? 'border border-slate-200' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, badge }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-brand-600" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
            {badge && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">{badge}</span>}
          </div>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function Divider({ className = '' }) {
  return <hr className={`border-slate-100 my-5 ${className}`} />
}
