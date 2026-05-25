export default function Button({
  children,
  onClick,
  variant = 'primary',
  size    = 'md',
  disabled = false,
  type    = 'button',
  className = '',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-400',
    ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    outline:   'border border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
        </svg>
      ) : Icon ? (
        <Icon size={size === 'xs' ? 13 : size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={14} />}
    </button>
  )
}
