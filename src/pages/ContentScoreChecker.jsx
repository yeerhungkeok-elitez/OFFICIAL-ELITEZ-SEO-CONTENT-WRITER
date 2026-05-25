import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Zap, ChevronRight, AlertTriangle, CheckCircle, Search, Heart, Link2, TrendingUp, BookOpen, MapPin, Star, Wrench } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { scoreContent, getScoreColor } from '../lib/scoreChecker'
import { applyFix, getFixType, FIX_LABELS } from '../lib/contentFixer'
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
  const msgMap = {
    'Ready to Publish':       'This content is well-optimised across all dimensions. Ready to go live.',
    'Needs Minor Edits':      'Strong content with a few improvements that will push it over the line.',
    'Needs Major Improvement':'Fix the priority issues below before publishing.',
    'Not Ready':              'Several critical SEO and content elements are missing. Review all issues.',
  }

  return (
    <div className={`flex items-center gap-5 p-5 rounded-xl border ${bg} ${border}`}>
      <ScoreRing score={score} size={90} />
      <div>
        <div className={`text-2xl font-bold ${text} mb-0.5`}>
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
  const [scoring, setScoring]   = useState(false)
  const [activeScoreId, setActiveScoreId] = useState(null)
  const [selectedContentId, setSelectedContentId] = useState(null)
  const [applying, setApplying] = useState({}) // { [fixIndex]: true } while applying

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
    setTimeout(() => {
      const updated  = applyFix(fixType, selectedContent, relatedBrief, activeProject)
      saveContent(updated)
      const newScore = scoreContent(updated, relatedBrief, activeProject)
      saveScore(newScore)
      setActiveScoreId(newScore.id)
      setApplying(prev => ({ ...prev, [idx]: false }))
    }, 800)
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

              {/* Priority Fixes */}
              {activeScore.priorityFixes?.length > 0 && (
                <Card>
                  <CardHeader
                    title="Priority Fixes"
                    subtitle="Highest-impact improvements — address these first"
                    icon={AlertTriangle}
                    badge={`${activeScore.priorityFixes.length} items`}
                  />
                  <div className="space-y-3">
                    {activeScore.priorityFixes.map((fix, i) => {
                      const fixType   = getFixType(fix)
                      const isApplying = applying[i]
                      return (
                        <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                          <div className="flex items-start gap-2 mb-1.5">
                            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-semibold text-red-800">{fix.msg}</span>
                          </div>
                          {fix.fix && (
                            <p className="text-xs text-red-700 ml-5 leading-relaxed">
                              <span className="font-semibold">Fix: </span>{fix.fix}
                            </p>
                          )}
                          <div className="ml-5 mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">
                              {fix.cat || fix.category} · -{fix.pts} pts
                            </span>
                            {fixType ? (
                              <button
                                onClick={() => handleApplyFix(fix, i)}
                                disabled={isApplying}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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
                              <span className="text-xs text-slate-400 italic">Manual edit required</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* All Issues */}
              {activeScore.issues?.length > 0 && (
                <Card>
                  <CardHeader
                    title="All Improvements"
                    subtitle={`${activeScore.issues.length} issue${activeScore.issues.length > 1 ? 's' : ''} found`}
                    icon={AlertTriangle}
                    badge={`${activeScore.issues.length} items`}
                  />
                  <div className="space-y-2">
                    {activeScore.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-amber-800">{issue}</span>
                      </div>
                    ))}
                  </div>
                </Card>
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
