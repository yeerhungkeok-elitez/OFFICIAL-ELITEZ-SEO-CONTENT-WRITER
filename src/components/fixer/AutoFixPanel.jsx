import { useState } from 'react'
import {
  Wand2, Zap, ShieldCheck, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Eye, EyeOff, ArrowRight,
  Wrench, RotateCcw, Info
} from 'lucide-react'
import { getFixType, applyFix, FIX_LABELS, FIX_SAFETY } from '../../lib/contentFixer'
import { computeContentDiff } from '../../lib/contentDiff'

// ── Safety badge ──────────────────────────────────────────────────────────────

function SafetyBadge({ level }) {
  if (level === 'safe') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
        <ShieldCheck size={10} /> Auto-safe
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
      <Info size={10} /> Review after
    </span>
  )
}

// ── Fix log entry ─────────────────────────────────────────────────────────────

function FixLogEntry({ entry }) {
  const delta = entry.wordsAfter - entry.wordsBefore
  const sign  = delta >= 0 ? '+' : ''
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
      <span className="flex-1">{entry.label}</span>
      {delta !== 0 && (
        <span className="text-slate-400 font-mono">{sign}{delta} words</span>
      )}
    </div>
  )
}

// ── Before/After preview for meta fields ──────────────────────────────────────

function MetaChangeRow({ field, before, after }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{field}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 line-through opacity-70">
          {before || <em className="not-italic opacity-50">empty</em>}
        </div>
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
          {after}
        </div>
      </div>
    </div>
  )
}

// ── Issue card with Preview / Apply / Ignore ──────────────────────────────────

function FixIssueCard({ fix, idx, content, brief, project, onApply, applying, ignored, onIgnore, status }) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewDiff, setPreviewDiff] = useState(null)

  const fixType    = getFixType(fix)
  const safety     = fixType ? FIX_SAFETY[fixType] : null
  const isApplying = applying[idx]
  // status = { changed, wordsAdded, label, fixType, newScore, oldScore } | null

  function handlePreview() {
    if (showPreview) { setShowPreview(false); return }
    if (!fixType || !content) return
    const updated = applyFix(fixType, content, brief, project)
    const diff    = computeContentDiff(content, updated)
    setPreviewDiff(diff)
    setShowPreview(true)
  }

  const catColors = {
    SEO:          'text-blue-700 bg-blue-50 border-blue-200',
    'SEO Readiness': 'text-blue-700 bg-blue-50 border-blue-200',
    Helpful:      'text-purple-700 bg-purple-50 border-purple-200',
    'Helpful Content': 'text-purple-700 bg-purple-50 border-purple-200',
    Conversion:   'text-orange-700 bg-orange-50 border-orange-200',
    'Conversion Potential': 'text-orange-700 bg-orange-50 border-orange-200',
    Links:        'text-teal-700 bg-teal-50 border-teal-200',
    'Internal Links': 'text-teal-700 bg-teal-50 border-teal-200',
    Readability:  'text-slate-700 bg-slate-50 border-slate-200',
    Local:        'text-green-700 bg-green-50 border-green-200',
    'Local Relevance': 'text-green-700 bg-green-50 border-green-200',
  }

  const catKey = fix.cat || fix.category || 'SEO'
  const catClass = catColors[catKey] || 'text-slate-700 bg-slate-50 border-slate-200'

  if (ignored) {
    return (
      <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl opacity-50">
        <span className="text-xs text-slate-400 italic flex-1">Issue ignored: {fix.msg?.slice(0, 60)}…</span>
        <button onClick={onIgnore} className="text-xs text-slate-400 hover:text-slate-600">Restore</button>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Issue header */}
      <div className="p-3 bg-white">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-snug">{fix.msg}</p>
            {fix.fix && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                <span className="font-medium text-slate-600">Fix: </span>{fix.fix}
              </p>
            )}
          </div>
        </div>

        {/* Tags + buttons */}
        <div className="flex items-center gap-1.5 flex-wrap ml-5">
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${catClass}`}>
            {catKey}
          </span>
          <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-200 font-medium">
            -{fix.pts} pts
          </span>
          {safety && <SafetyBadge level={safety} />}

          {/* Per-fix result badge */}
          {status && !isApplying && (
            status.changed ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                <CheckCircle size={10} />
                Applied{status.wordsAdded > 0 ? ` (+${status.wordsAdded} words)` : ''}
                {status.newScore > status.oldScore ? ` · Score +${status.newScore - status.oldScore}` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                <AlertTriangle size={10} />
                Still needs review — content already meets this criteria
              </span>
            )
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {fixType && (
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                {showPreview ? <EyeOff size={11} /> : <Eye size={11} />}
                {showPreview ? 'Hide' : 'Preview'}
              </button>
            )}
            {fixType ? (
              <button
                onClick={() => onApply(fix, idx)}
                disabled={isApplying}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isApplying ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                    </svg>
                    Applying…
                  </>
                ) : (
                  <>
                    <Wrench size={11} />
                    {FIX_LABELS[fixType] || 'Apply Fix'}
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic px-2">Manual edit required</span>
            )}
            <button
              onClick={onIgnore}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded hover:bg-slate-100 transition-all"
              title="Ignore this issue"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      {showPreview && previewDiff && (
        <div className="border-t border-slate-200 bg-slate-50 p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Preview of changes</p>

          {/* Meta changes */}
          {previewDiff.metaChanges?.map((c, i) => (
            <MetaChangeRow key={i} field={c.field} before={c.before} after={c.after} />
          ))}

          {/* Body additions */}
          {previewDiff.body?.added?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1.5">Content to be added:</p>
              <div className="space-y-1.5">
                {previewDiff.body.added.slice(0, 3).map((block, i) => (
                  <div key={i} className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 leading-relaxed line-clamp-3">
                    {block.slice(0, 300)}{block.length > 300 ? '…' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Word count delta */}
          {previewDiff.body?.hasChanges && (
            <p className="text-xs text-slate-500">
              Word count: <strong>{previewDiff.wordsBefore.toLocaleString()}</strong>
              {' → '}
              <strong className="text-green-700">{previewDiff.wordsAfter.toLocaleString()}</strong>
              {previewDiff.body.wordsAdded > 0 && (
                <span className="text-green-600 ml-1">(+{previewDiff.body.wordsAdded} words)</span>
              )}
            </p>
          )}

          {!previewDiff.hasChanges && (
            <p className="text-xs text-slate-400 italic">No visible change — this issue may already be resolved.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AUTO-FIX PANEL
// ═══════════════════════════════════════════════════════════════════════════════

export default function AutoFixPanel({
  score,
  content,
  brief,
  project,
  onApplyFix,        // fn(fix, idx) — applies a single fix from priority list
  onAutoFix,         // fn('all'|'critical'|'placeholders') — batch fixes
  onReScore,         // fn() — triggers re-score
  applying,          // { [idx]: bool }
  autoFixing,        // bool
  fixLog,            // [{ type, label, wordsBefore, wordsAfter }]
  scoreBefore,       // number — score before auto-fix
  fixStatus,         // { [idx]: { changed, wordsAdded, label, newScore, oldScore } }
  priorityFixes,     // array from score
  allIssues,         // structured issues array
}) {
  const [ignoredIdxs, setIgnoredIdxs]     = useState(new Set())
  const [showAllIssues, setShowAllIssues] = useState(false)
  const [showLog, setShowLog]             = useState(true)

  function toggleIgnore(idx) {
    setIgnoredIdxs(prev => {
      const s = new Set(prev)
      s.has(idx) ? s.delete(idx) : s.add(idx)
      return s
    })
  }

  const fixableCount  = (priorityFixes || []).filter(f => getFixType(f)).length
  const criticalCount = (allIssues || []).filter(i => (i.pts || 0) >= 15 && getFixType(i)).length
  const totalWords    = content?.wordCount || 0
  const wordsAdded    = fixLog?.reduce((sum, e) => sum + (e.wordsAfter - e.wordsBefore), 0) || 0

  return (
    <div className="space-y-4">

      {/* ── Auto-Fix Controls ─────────────────────────────────────── */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-brand-400" />
            <span className="text-white font-semibold text-sm">Auto-Fix Controls</span>
          </div>
          {fixableCount > 0 && (
            <span className="text-xs text-slate-400">{fixableCount} fixable issue{fixableCount > 1 ? 's' : ''} detected</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAutoFix('all')}
            disabled={autoFixing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {autoFixing ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                </svg>
                Fixing…
              </>
            ) : (
              <>
                <Wand2 size={12} /> Auto-Fix All Safe Issues
              </>
            )}
          </button>

          <button
            onClick={() => onAutoFix('critical')}
            disabled={autoFixing || criticalCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <Zap size={12} /> Fix Critical Issues ({criticalCount})
          </button>

          <button
            onClick={() => onAutoFix('placeholders')}
            disabled={autoFixing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <ShieldCheck size={12} /> Fix Placeholders Only
          </button>

          <button
            onClick={onReScore}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm ml-auto"
          >
            <RotateCcw size={12} /> Re-Score
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2.5">
          Auto-safe fixes add content and improve metadata without inventing facts, fake stats, or specific claims.
        </p>
      </div>

      {/* ── Fix Log / Before-After Summary ────────────────────────── */}
      {fixLog && fixLog.length > 0 && (
        <div className="border border-green-200 bg-green-50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowLog(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                {fixLog.length} fix{fixLog.length > 1 ? 'es' : ''} applied
              </span>
              {wordsAdded > 0 && (
                <span className="text-xs text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                  +{wordsAdded} words added
                </span>
              )}
              {scoreBefore != null && score != null && score > scoreBefore && (
                <span className="text-xs text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                  Score: {scoreBefore} → {score}
                </span>
              )}
            </div>
            {showLog ? <ChevronUp size={14} className="text-green-600" /> : <ChevronDown size={14} className="text-green-600" />}
          </button>

          {showLog && (
            <div className="px-4 pb-4 space-y-2 border-t border-green-200">
              <div className="space-y-1.5 mt-3">
                {fixLog.map((entry, i) => <FixLogEntry key={i} entry={entry} />)}
              </div>
              <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                <p className="text-xs text-green-700">
                  Article: <strong>{totalWords.toLocaleString()}</strong> words total
                </p>
                <button
                  onClick={onReScore}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <RotateCcw size={11} /> Re-Score Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Priority Fixes (issue-level cards) ───────────────────── */}
      {priorityFixes && priorityFixes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              Priority Fixes — {priorityFixes.length} item{priorityFixes.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-2">
            {priorityFixes.map((fix, i) => (
              <FixIssueCard
                key={i}
                fix={fix}
                idx={i}
                content={content}
                brief={brief}
                project={project}
                onApply={onApplyFix}
                applying={applying}
                ignored={ignoredIdxs.has(i)}
                onIgnore={() => toggleIgnore(i)}
                status={fixStatus?.[i] ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── All Issues accordion ──────────────────────────────────── */}
      {allIssues && allIssues.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAllIssues(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-700">
              All Improvements ({allIssues.length})
            </span>
            {showAllIssues ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>
          {showAllIssues && (
            <div className="p-4 space-y-2">
              {allIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-amber-800">{typeof issue === 'string' ? issue : issue.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
