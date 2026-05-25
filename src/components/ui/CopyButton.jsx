import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ text, label = 'Copy', size = 'sm' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // fallback for browsers without clipboard API
      const ta = document.createElement('textarea')
      ta.value = text || ''
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const sizeClass = size === 'xs'
    ? 'px-2 py-1 text-xs gap-1'
    : size === 'sm'
    ? 'px-2.5 py-1.5 text-xs gap-1.5'
    : 'px-3 py-2 text-sm gap-2'

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center font-medium rounded-lg transition-all
        ${copied
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200'
        } ${sizeClass}`}
    >
      {copied
        ? <><Check size={13} /> Copied!</>
        : <><Copy size={13} /> {label}</>
      }
    </button>
  )
}
