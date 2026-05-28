import { useState, useEffect, useRef } from 'react'
import { Save, CheckCircle, BarChart2, Key, Eye, Code } from 'lucide-react'

// ── Simple markdown preview ───────────────────────────────────────────────────

function MarkdownPreview({ text }) {
  const html = (text || '')
    .replace(/^# (.+)$/gm,   '<h1 class="text-2xl font-bold text-slate-900 mt-6 mb-3">$1</h1>')
    .replace(/^## (.+)$/gm,  '<h2 class="text-xl font-semibold text-slate-800 mt-5 mb-2 pt-4 border-t border-slate-100">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-slate-700 mt-3 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc text-slate-700">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, m => `<ul class="space-y-1 my-3">${m}</ul>`)
    .replace(/^(?!<[a-z])(.+)$/gm, '<p class="text-slate-700 leading-7 mb-3">$1</p>')
  return <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function FieldLabel({ label, hint, charCount, limit }) {
  const over  = charCount > limit
  const under = charCount < Math.round(limit * 0.75)
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      {charCount != null && (
        <span className={`text-xs font-mono ${over ? 'text-red-500' : under ? 'text-amber-500' : 'text-green-600'}`}>
          {charCount}/{limit}
        </span>
      )}
      {hint && !charCount && (
        <span className="text-xs text-slate-400">{hint}</span>
      )}
    </div>
  )
}

// ── Auto-save delay ───────────────────────────────────────────────────────────

const AUTOSAVE_MS = 800

function fieldsFrom(c) {
  return {
    title:           c?.title           || '',
    focusKeyphrase:  c?.focusKeyphrase  || '',
    metaTitle:       c?.metaTitle       || '',
    metaDescription: c?.metaDescription || '',
    slug:            c?.slug            || '',
    body:            c?.body            || '',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRAFT EDITOR
//
// Props:
//   content     — the content object from activeProject.generatedContent
//   onSave      — fn(updatedContent) — persists to ProjectContext / localStorage
//   onReScore   — fn() — called after save when user clicks "Save & Re-Score"
// ═══════════════════════════════════════════════════════════════════════════════

export default function DraftEditor({ content, onSave, onReScore }) {
  const [fields, setFields]   = useState(() => fieldsFrom(content))
  const [status, setStatus]   = useState('saved')   // 'unsaved' | 'saving' | 'saved'
  const [lastSaved, setLastSaved] = useState(null)
  const [viewMode, setViewMode]   = useState('edit') // 'edit' | 'preview'

  const timerRef  = useRef(null)
  const fieldsRef = useRef(fields)
  fieldsRef.current = fields   // always current without re-renders

  // ── Reset when switching articles ─────────────────────────────────────────
  useEffect(() => {
    if (!content) return
    setFields(fieldsFrom(content))
    setStatus('saved')
    setLastSaved(null)
  }, [content?.id])

  // ── Sync external changes (e.g. Auto-Fix applied elsewhere) ──────────────
  // Only sync when user isn't mid-edit to avoid clobbering unsaved work
  useEffect(() => {
    if (!content || status === 'unsaved') return
    setFields(fieldsFrom(content))
  }, [content?.updatedAt, content?.wordCount])

  // ── Change handler + debounced auto-save ─────────────────────────────────
  function handleChange(field, value) {
    const next = { ...fieldsRef.current, [field]: value }
    setFields(next)
    setStatus('unsaved')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => commit(next), AUTOSAVE_MS)
  }

  // ── Core save ─────────────────────────────────────────────────────────────
  function commit(currentFields) {
    if (!content) return
    setStatus('saving')
    const wc = currentFields.body.split(/\s+/).filter(Boolean).length
    onSave({
      ...content,
      ...currentFields,
      wordCount: wc,
      updatedAt: new Date().toISOString(),
    })
    setLastSaved(new Date())
    setStatus('saved')
  }

  function handleManualSave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    commit(fieldsRef.current)
  }

  function handleSaveAndScore() {
    if (timerRef.current) clearTimeout(timerRef.current)
    commit(fieldsRef.current)
    // Small delay so saveContent's React state update propagates before navigation
    setTimeout(() => onReScore?.(), 80)
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const wc           = fields.body.split(/\s+/).filter(Boolean).length
  const metaTitleLen = fields.metaTitle.length
  const metaDescLen  = fields.metaDescription.length

  return (
    <div className="space-y-3">

      {/* ── Save status bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          {status === 'unsaved' && (
            <span className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          )}
          {status === 'saving' && (
            <span className="flex items-center gap-1.5 text-xs text-brand-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Saving…
            </span>
          )}
          {status === 'saved' && (
            <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
              <CheckCircle size={12} className="text-green-500" />
              {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Draft saved'}
            </span>
          )}
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            wc >= 1200 ? 'bg-green-100 text-green-700' :
            wc >= 800  ? 'bg-amber-100 text-amber-700' :
                         'bg-red-100 text-red-600'
          }`}>
            {wc.toLocaleString()} words
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleManualSave}
            disabled={status === 'saved'}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Save size={11} /> Save
          </button>
          <button
            onClick={handleSaveAndScore}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all shadow-sm"
          >
            <BarChart2 size={11} /> Save &amp; Re-Score
          </button>
        </div>
      </div>

      {/* ── Meta fields ─────────────────────────────────────────────── */}
      <div className="space-y-2.5 p-3 bg-white border border-slate-200 rounded-xl">

        {/* H1 Title */}
        <div>
          <FieldLabel label="Article Title (H1)" />
          <input
            type="text"
            value={fields.title}
            onChange={e => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-900 bg-white"
            placeholder="Article H1 headline"
          />
        </div>

        {/* Focus Keyphrase + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <FieldLabel label="Focus Keyphrase" />
            <div className="relative">
              <Key size={12} className="absolute left-2.5 top-2.5 text-amber-500" />
              <input
                type="text"
                value={fields.focusKeyphrase}
                onChange={e => handleChange('focusKeyphrase', e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50 text-slate-700"
                placeholder="target keyphrase"
              />
            </div>
          </div>
          <div>
            <FieldLabel label="URL Slug" hint="lowercase, hyphens only" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 flex-shrink-0">/blog/</span>
              <input
                type="text"
                value={fields.slug}
                onChange={e => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="flex-1 px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-700"
                placeholder="url-slug"
              />
            </div>
          </div>
        </div>

        {/* Meta Title */}
        <div>
          <FieldLabel label="Meta Title" charCount={metaTitleLen} limit={62} />
          <input
            type="text"
            value={fields.metaTitle}
            onChange={e => handleChange('metaTitle', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-700"
            placeholder="Meta title — include focus keyphrase (50–62 chars)"
          />
        </div>

        {/* Meta Description */}
        <div>
          <FieldLabel label="Meta Description" charCount={metaDescLen} limit={162} />
          <textarea
            value={fields.metaDescription}
            onChange={e => handleChange('metaDescription', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-slate-700 resize-none leading-relaxed"
            placeholder="Meta description — include keyphrase + benefit (130–162 chars)"
          />
        </div>
      </div>

      {/* ── View mode toggle ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${viewMode === 'edit' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Code size={13} /> Edit Markdown
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${viewMode === 'preview' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Eye size={13} /> Preview
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      {viewMode === 'edit' ? (
        <textarea
          value={fields.body}
          onChange={e => handleChange('body', e.target.value)}
          className="w-full h-[640px] p-5 font-mono text-sm text-slate-200 bg-slate-900 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed"
          spellCheck={false}
          placeholder="Article body in Markdown — type freely, changes save automatically…"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[400px] max-h-[640px] overflow-y-auto">
          <MarkdownPreview text={fields.body} />
        </div>
      )}
    </div>
  )
}
