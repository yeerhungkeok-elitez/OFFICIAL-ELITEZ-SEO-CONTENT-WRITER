import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Zap, ChevronRight, AlertTriangle, CheckCircle, Search, Heart, Link2, TrendingUp, BookOpen, MapPin, Star, Wrench, Key } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { scoreContent, getScoreColor } from '../lib/scoreChecker'
import { applyFix, getFixType, FIX_LABELS, autoFix, fixCriticalIssues } from '../lib/contentFixer'
import AutoFixPanel from '../components/fixer/AutoFixPanel'
import Card, { CardHeader, Divider } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const SCORE_META = [
  { key: 'seo',         label: 'SEO Readiness',      icon: Search,     weight: '25%', desc: 'Keyword placement, meta tags, headings, density' },
  { key: 'helpful',     label: 'Helpful Content',     icon: Heart,      weight: '22%', desc: 'Word count, FAQs, examples, honest expectations' },
  { key: 'readability', label: 'Readability',         icon: BookOpen,   weight: '18%', desc: 'Sentence length, paragraphs, scannability' },
  { key: 'conversion',  label: 'Conversion Potential',icon: TrendingUp, weight: '15%', desc: 'CTAs, trust signals, next step clarity' },
  { key: 'links',       label: 'Internal Links',      icon: Link2,      weight: '12%', desc: 'Link presence, anchor text, contact path' },
  { key: 'local',       label: 'Local Relevance',     icon: MapPin,     weight: '8%',  desc: 'Country context, regulations, grants, market terms' },
]

function ScoreRing({ score, size = 80 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)
  const { ring, text } = getScoreColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={ring}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="transition-all duration-700"
        />
      </svg>
      <span className={`absolute text-lg font-bold ${text}`}>{score}</span>
    </div>
  )
}

function ScoreBar({ score, label, icon: Icon, weight, desc }) {
  const { text, bg, border } = getScoreColor(score)
  return (
    <div className="flex items-center gap-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} border ${border}`}>
        <Icon size={16} className={text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <span className="text-xs text-slate-400 ml-2">({weight})</span>
          </div>
          <span className={`text-sm font-bold ${text}`}>{score}/100</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: getScoreColor(score).ring }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  )
}

function GradePanel({ score, publishReadiness }) {
  const { text, bg, border } = getScoreColor(score)
  const pr = publishReadiness || (
    score >= 85 ? { label: 'Ready to Publish',       color: 'green', emoji: '🚀' } :
    score >= 70 ? { label: 'Needs Minor Edits',       color: 'blue',  emoji: '✏️' } :
    score >= 55 ? { label: 'Needs Major Improvement', color: 'amber', emoji: '⚠️' } :
                  { label: 'Not Ready',               color: 'red',   emoji: '🔧' }
  )
  const isPlaceholderBlock = pr.label === 'Not Ready — Fix Placeholders'
  const msgMap = {
    'Ready to Publish':               'This content is well-optimised across all dimensions. Ready to go live.',
    'Needs Minor Edits':              'Strong content with a few improvements that will push it over the line.',
    'Needs Major Improvement':        'Fix the priority issues below before publishing.',
    'Not Ready':                      'Several critical SEO and content elements are missing. Review all issues.',
    'Not Ready — Fix Placeholders':   'Unresolved placeholder text was detected. Replace all [bracketed] placeholders before publishing.',
  }

  return (
    <div className={`flex items-center gap-5 p-5 rounded-xl border ${isPlaceholderBlock ? 'bg-red-50 border-red-200' : `${bg} ${border}`}`}>
      <ScoreRing score={score} size={90} />
      <div>
        <div className={`text-2xl font-bold ${isPlaceholderBlock ? 'text-red-600' : text} mb-0.5`}>
          {pr.emoji} {pr.label}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{msgMap[pr.label] || ''}</p>
        <div className="text-xs text-slate-500 mt-1">
          Overall SEO Content Score: <strong>{score}/100</strong>
        </div>
      </div>
    </div>
  )
}

export default function ContentScoreChecker() {
  const { activeProject, saveScore, saveContent } = useProject()
  const navigate = useNavigate()
  const [scoring, setScoring]           = useState(false)
  const [activeScoreId, setActiveScoreId] = useState(null)
  const [selectedContentId, setSelectedContentId] = useState(null)
  const [applying, setApplying]         = useState({})   // { [fixIndex]: bool }
  const [autoFixing, setAutoFixing]     = useState(false)
  const [fixLog, setFixLog]             = useState([])   // fix history for current session
  const [scoreBefore, setScoreBefore]   = useState(null) // score before last auto-fix batch
  const [fixStatus, setFixStatus]       = useState({})   // { [fixIndex]: { changed, wordsAdded, label } }
  const [debugLog, setDebugLog]         = useState([])   // dev debug entries
  const [showDebug, setShowDebug]       = useState(false)

  const contents = activeProject?.generatedContent || []
  const briefs   = activeProject?.briefs || []
  const scores   = activeProject?.scores || []

  const selectedContent = contents.find(c => c.id === selectedContentId) || contents[0] || null
  const relatedBrief    = briefs.find(b => b.id === selectedContent?.briefId) || null
  const activeScore     = scores.find(s => s.id === activeScoreId) ||
    scores.find(s => s.contentId === selectedContent?.id) || null

  function handleScore() {
    if (!selectedContent) return
    setScoring(true)
    setTimeout(() => {
      const result = scoreContent(selectedContent, relatedBrief, activeProject)
      saveScore(result)
      setActiveScoreId(result.id)
      setScoring(false)
    }, 1000)
  }

  function handleApplyFix(fix, idx) {
    const fixType = getFixType(fix)
    if (!fixType || !selectedContent) return
    setApplying(prev => ({ ...prev, [idx]: true }))
    // Clear previous status for this index
    setFixStatus(prev => ({ ...prev, [idx]: null }))

    setTimeout(() => {
      const bodyBefore  = selectedContent.body || ''
      const wBefore     = selectedContent.wordCount || 0
      const updated     = applyFix(fixType, selectedContent, relatedBrief, activeProject)
      const changed     = updated.body !== bodyBefore
        || updated.metaTitle !== selectedContent.metaTitle
        || updated.metaDescription !== selectedContent.metaDescription
      const wAfter      = updated.wordCount || 0
      const wordsAdded  = wAfter - wBefore
      const label       = FIX_LABELS[fixType] || fixType

      saveContent(updated)
      const newScore = scoreContent(updated, relatedBrief, activeProject)
      saveScore(newScore)
      setActiveScoreId(newScore.id)

      // Per-fix status for inline badge
      setFixStatus(prev => ({
        ...prev,
        [idx]: { changed, wordsAdded, label, fixType,
          newScore: newScore.overall, oldScore: activeScore?.overall ?? 0 },
      }))

      // Accumulate fix log (only when something actually changed)
      if (changed) {
        setFixLog(prev => [...prev, { type: fixType, label, wordsBefore: wBefore, wordsAfter: wAfter }])
      }

      // Debug log entry
      setDebugLog(prev => [...prev, {
        ts:              new Date().toLocaleTimeString(),
        action:          `Apply Fix: ${label}`,
        fixType,
        changed,
        wordsBefore:     wBefore,
        wordsAfter:      wAfter,
        wordsAdded,
        scoreBefore:     activeScore?.overall ?? '–',
        scoreAfter:      newScore.overall,
        remainingIssues: (newScore.priorityFixes || []).length,
      }])

      setApplying(prev => ({ ...prev, [idx]: false }))
    }, 800)
  }

  // Batch fix modes: 'all' | 'critical' | 'placeholders'
  function handleAutoFix(mode) {
    if (!selectedContent) return
    setAutoFixing(true)
    const oldScore = activeScore?.overall ?? null
    setScoreBefore(oldScore)
    // Clear per-issue status badges since we're doing a batch run
    setFixStatus({})

    setTimeout(() => {
      const wBefore = selectedContent.wordCount || 0
      let result

      if (mode === 'placeholders') {
        const fixed = applyFix('placeholders', selectedContent, relatedBrief, activeProject)
        const changed = fixed.body !== selectedContent.body
        result = {
          content: fixed,
          log: changed
            ? [{ type: 'placeholders', label: 'Fix placeholder text',
                wordsBefore: wBefore, wordsAfter: fixed.wordCount || 0 }]
            : [],
        }
      } else if (mode === 'critical') {
        result = fixCriticalIssues(
          selectedContent, relatedBrief, activeProject,
          activeScore?.structuredIssues || [],
        )
      } else {
        result = autoFix(selectedContent, relatedBrief, activeProject)
      }

      saveContent(result.content)
      const newScore = scoreContent(result.content, relatedBrief, activeProject)
      saveScore(newScore)
      setActiveScoreId(newScore.id)
      if (result.log.length > 0) setFixLog(prev => [...prev, ...result.log])

      // Debug log entry
      setDebugLog(prev => [...prev, {
        ts:              new Date().toLocaleTimeString(),
        action:          `Auto-Fix (${mode})`,
        changed:         result.log.length > 0,
        fixesApplied:    result.log.map(e => e.label).join(', ') || 'none',
        wordsBefore:     wBefore,
        wordsAfter:      result.content.wordCount || 0,
        wordsAdded:      (result.content.wordCount || 0) - wBefore,
        scoreBefore:     oldScore ?? '–',
        scoreAfter:      newScore.overall,
        remainingIssues: (newScore.priorityFixes || []).length,
      }])

      setAutoFixing(false)
    }, 1200)
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart2 size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No project found</p>
          <Button onClick={() => navigate('/project')}>Go to Project Setup</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">5</span>
            Step 5 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Content Score Checker</h1>
          <p className="text-slate-500 text-sm mt-1">
            Checks 6 dimensions: SEO readiness, helpful content, readability, conversion, internal links, and local relevance.
          </p>
        </div>
      </div>

      {contents.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-sm mb-1">No content to score</p>
          <p className="text-amber-700 text-sm mb-3">Write an article first before scoring.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/writer')}>Go to SEO Writer</Button>
        </div>
      )}

      {contents.length > 0 && (
        <>
          {/* Content selector */}
          <Card>
            <CardHeader title="Select Content to Score" icon={BarChart2} />
            <div className="flex flex-wrap gap-2 mb-4">
              {contents.map(c => {
                const hasScore = scores.some(s => s.contentId === c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedContentId(c.id)
                      const existing = scores.find(s => s.contentId === c.id)
                      setActiveScoreId(existing?.id || null)
                    }}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all capitalize
                      ${selectedContent?.id === c.id
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {c.targetKeyword?.slice(0, 35) || 'Article'}
                    {hasScore && <span className="ml-1.5 opacity-75">✓</span>}
                  </button>
                )
              })}
            </div>

            {selectedContent && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{selectedContent.targetKeyword}</p>
                  <p className="text-xs text-slate-500">
                    {selectedContent.wordCount} words · Generated {new Date(selectedContent.createdAt).toLocaleDateString()}
                  </p>
                  {selectedContent.focusKeyphrase && (
                    <div className="flex items-center gap-1 mt-1">
                      <Key size={11} className="text-amber-500" />
                      <span className="text-xs text-amber-700 font-medium">{selectedContent.focusKeyphrase}</span>
                    </div>
                  )}
                </div>
                <Button onClick={handleScore} loading={scoring} icon={Zap} size="sm">
                  {activeScore ? 'Re-Score' : 'Score Now'}
                </Button>
              </div>
            )}
          </Card>

          {/* Score result */}
          {scoring && (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Analysing content…</p>
              <p className="text-slate-400 text-sm">Checking SEO, helpfulness, readability, and conversion signals</p>
            </Card>
          )}

          {activeScore && !scoring && (
            <>
              {/* Grade */}
              <GradePanel score={activeScore.overall} publishReadiness={activeScore.publishReadiness} />

              {/* Breakdown */}
              <Card>
                <CardHeader title="Score Breakdown" subtitle="Weighted across 6 dimensions" icon={BarChart2} />
                <div className="space-y-5">
                  {SCORE_META.map(m => (
                    <ScoreBar
                      key={m.key}
                      score={activeScore.breakdown[m.key] ?? 80}
                      label={m.label}
                      icon={m.icon}
                      weight={m.weight}
                      desc={m.desc}
                    />
                  ))}
                </div>
              </Card>

              {/* What's Working */}
              {activeScore.strengths?.length > 0 && (
                <Card>
                  <CardHeader title="What's Working" subtitle="Positive signals detected across dimensions" icon={Star} badge={`${activeScore.strengths.length} signals`} />
                  <div className="space-y-2">
                    {activeScore.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-800">{s}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Auto-Fix Panel — replaces Priority Fixes + All Issues cards */}
              <Card>
                <CardHeader
                  title="Recommended Fixes"
                  subtitle="Auto-apply safe fixes or address issues one by one"
                  icon={AlertTriangle}
                  badge={activeScore.priorityFixes?.length ? `${activeScore.priorityFixes.length} priority` : undefined}
                />
                <AutoFixPanel
                  score={activeScore.overall}
                  content={selectedContent}
                  brief={relatedBrief}
                  project={activeProject}
                  onApplyFix={handleApplyFix}
                  onAutoFix={handleAutoFix}
                  onReScore={handleScore}
                  applying={applying}
                  autoFixing={autoFixing}
                  fixLog={fixLog}
                  scoreBefore={scoreBefore}
                  fixStatus={fixStatus}
                  priorityFixes={activeScore.priorityFixes || []}
                  allIssues={activeScore.structuredIssues || activeScore.issues || []}
                />
              </Card>

              {/* Debug log panel */}
              {debugLog.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowDebug(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-left"
                  >
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      DEBUG LOG ({debugLog.length} operations)
                    </span>
                    <span className="text-xs text-slate-400">{showDebug ? '▲ hide' : '▼ show'}</span>
                  </button>
                  {showDebug && (
                    <div className="p-3 bg-slate-950 overflow-x-auto">
                      <table className="w-full text-xs font-mono text-slate-300 border-collapse">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800">
                            <th className="text-left pb-1 pr-3">Time</th>
                            <th className="text-left pb-1 pr-3">Action</th>
                            <th className="text-right pb-1 pr-3">Words before</th>
                            <th className="text-right pb-1 pr-3">Words after</th>
                            <th className="text-right pb-1 pr-3">Delta</th>
                            <th className="text-right pb-1 pr-3">Score before</th>
                            <th className="text-right pb-1 pr-3">Score after</th>
                            <th className="text-right pb-1">Remaining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {debugLog.map((entry, i) => (
                            <tr key={i} className={`border-b border-slate-900 ${entry.changed ? 'text-green-400' : 'text-amber-400'}`}>
                              <td className="py-1 pr-3 text-slate-500">{entry.ts}</td>
                              <td className="py-1 pr-3 text-slate-200">{entry.action}</td>
                              <td className="py-1 pr-3 text-right">{entry.wordsBefore?.toLocaleString()}</td>
                              <td className="py-1 pr-3 text-right">{entry.wordsAfter?.toLocaleString()}</td>
                              <td className="py-1 pr-3 text-right">{entry.wordsAdded > 0 ? `+${entry.wordsAdded}` : entry.wordsAdded || '0'}</td>
                              <td className="py-1 pr-3 text-right">{entry.scoreBefore}</td>
                              <td className="py-1 pr-3 text-right">{entry.scoreAfter}</td>
                              <td className="py-1 text-right">{entry.remainingIssues ?? '–'} issues</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {debugLog.some(e => !e.changed) && (
                        <p className="mt-2 text-xs text-amber-400 font-mono">
                          ⚠ Amber rows = fix ran but content was already in target state (guard triggered). Check console for details.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeScore.overall >= 70 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Ready to publish!</p>
                    <p className="text-green-700 text-xs mt-0.5">Your content scored {activeScore.overall}/100. Export it to WordPress now.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={() => navigate('/export')} iconRight={ChevronRight}>
                  Next: WordPress Export
                </Button>
                <Button variant="secondary" onClick={() => navigate('/writer')}>
                  Back to Editor
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
