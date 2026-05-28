import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, Zap, ChevronRight, FileText, RefreshCw, Brain, Key } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { generateContent } from '../lib/contentWriter'
import { isBrandBrainConfigured } from '../lib/brandBrain'
import DraftEditor from '../components/editor/DraftEditor'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { FunnelBadge } from '../components/ui/Badge'

function WordCountBadge({ count }) {
  const color = count >= 1200 ? 'green' : count >= 800 ? 'amber' : 'red'
  return <Badge label={`${count} words`} color={color} />
}

export default function SEOContentWriter() {
  const { activeProject, saveContent } = useProject()
  const navigate = useNavigate()
  const brainActive = isBrandBrainConfigured()
  const [generating, setGenerating] = useState(false)
  const [activeContentId, setActiveContentId] = useState(null)
  const [activeBriefId, setActiveBriefId] = useState(null)

  const briefs   = activeProject?.briefs || []
  const contents = activeProject?.generatedContent || []

  const selectedBrief   = briefs.find(b => b.id === activeBriefId) || briefs[0] || null
  const selectedContent = contents.find(c => c.id === activeContentId) ||
    contents.find(c => c.briefId === selectedBrief?.id) || null

  function handleGenerate() {
    if (!selectedBrief || !activeProject) return
    setGenerating(true)
    setTimeout(() => {
      const content = generateContent(selectedBrief, activeProject)
      saveContent(content)
      setActiveContentId(content.id)
      setGenerating(false)
      setViewMode('preview')
    }, 1500)
  }

  function handleDraftSave(updatedContent) {
    saveContent(updatedContent)
  }

  function handleSaveAndScore() {
    navigate('/score')
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <PenLine size={40} className="text-slate-300 mx-auto mb-3" />
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
            <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded text-xs font-bold flex items-center justify-center">4</span>
            Step 4 of 6
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SEO Content Writer</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generates a full article from your brief. Uses your company name, services, and audience — not generic filler.
          </p>
        </div>
      </div>

      {/* No briefs */}
      {briefs.length === 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-amber-800 font-medium text-sm mb-1">No content briefs found</p>
          <p className="text-amber-700 text-sm mb-3">Generate a content brief first before writing content.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/brief')}>Go to Brief Generator</Button>
        </div>
      )}

      {briefs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Brief Selector & Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Select Brief" icon={FileText} />
              <div className="space-y-2">
                {briefs.map(brief => {
                  const hasContent = contents.some(c => c.briefId === brief.id)
                  return (
                    <button
                      key={brief.id}
                      onClick={() => {
                        setActiveBriefId(brief.id)
                        const existing = contents.find(c => c.briefId === brief.id)
                        setActiveContentId(existing?.id || null)
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all
                        ${selectedBrief?.id === brief.id
                          ? 'border-brand-400 bg-brand-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800 capitalize leading-tight">
                          {brief.targetKeyword}
                        </span>
                        {hasContent && (
                          <span className="text-xs text-brand-600 font-medium flex-shrink-0">✓ Written</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <FunnelBadge funnel={brief.funnel} />
                        <Badge label={brief.pageType} color="slate" size="xs" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {selectedBrief && (
              <Card>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Brief Summary</p>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-500">Target:</span> <span className="font-medium capitalize">{selectedBrief.targetKeyword}</span></div>
                  {selectedBrief.focusKeyphrase && selectedBrief.focusKeyphrase !== selectedBrief.targetKeyword && (
                    <div className="flex items-center gap-1.5">
                      <Key size={11} className="text-amber-500" />
                      <span className="text-slate-500 text-xs">Focus:</span>
                      <span className="text-xs font-medium text-amber-700">{selectedBrief.focusKeyphrase}</span>
                    </div>
                  )}
                  <div><span className="text-slate-500">Page type:</span> <span>{selectedBrief.pageType}</span></div>
                  <div><span className="text-slate-500">Word target:</span> <span>{selectedBrief.wordCountTarget}</span></div>
                  <div><span className="text-slate-500">Audience:</span> <span className="line-clamp-2">{selectedBrief.audience}</span></div>
                  {brainActive && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Brain size={11} className="text-brand-500" />
                      <span className="text-xs text-brand-600 font-medium">Brand Brain active</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handleGenerate}
                    loading={generating}
                    icon={selectedContent ? RefreshCw : Zap}
                    className="w-full justify-center"
                  >
                    {generating ? 'Writing...' : selectedContent ? 'Regenerate Article' : 'Generate Article'}
                  </Button>
                </div>
              </Card>
            )}

            {selectedContent && (
              <Card>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">Article Details</p>
                <div className="space-y-2 text-sm">
                  <WordCountBadge count={selectedContent.wordCount} />
                  <div className="text-xs text-slate-500 mt-2">
                    Generated {new Date(selectedContent.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button size="sm" variant="secondary" className="w-full justify-center" onClick={() => navigate('/score')}>
                    Score This Content
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full justify-center" onClick={() => navigate('/export')}>
                    Export to WordPress
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Content Area */}
          <div className="lg:col-span-2 space-y-3">
            {!selectedContent && !generating && (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <PenLine size={48} className="text-slate-200 mb-4" />
                <h3 className="text-slate-600 font-semibold mb-1">No content yet</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-sm">
                  Select a brief on the left and click "Generate Article" to create a full SEO article tailored to your business.
                </p>
                {selectedBrief && (
                  <Button onClick={handleGenerate} loading={generating} icon={Zap}>
                    Generate Article for "{selectedBrief.targetKeyword}"
                  </Button>
                )}
              </Card>
            )}

            {generating && (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
                <h3 className="text-slate-700 font-semibold mb-1">Writing your article…</h3>
                <p className="text-slate-400 text-sm">Applying your business context, brief structure, and SEO principles.</p>
              </Card>
            )}

            {selectedContent && !generating && (
              <>
                {/* Draft Editor — edits all fields, auto-saves, re-scores on demand */}
                <DraftEditor
                  content={selectedContent}
                  onSave={handleDraftSave}
                  onReScore={handleSaveAndScore}
                />

                <div className="flex items-center gap-3 pt-1">
                  <Button variant="primary" onClick={() => navigate('/score')} iconRight={ChevronRight}>
                    Next: Score This Content
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/export')} iconRight={ChevronRight}>
                    Skip to WordPress Export
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
